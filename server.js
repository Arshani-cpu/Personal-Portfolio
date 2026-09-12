const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectMongoDB, connectMySQL, getDatabaseStatus, getMongoStatus, getMySQLPool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Database Connections (MongoDB & MySQL)
connectMongoDB();
connectMySQL();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// File Database Paths (Fallback & Local Execution)
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

// Mongoose Models for MongoDB
const ProjectModel = require('./models/Project');
const MessageModel = require('./models/Message');

// Helper: Read Local Data
function getLocalPortfolioData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading portfolio.json:', err);
    return null;
  }
}

// Helper: Save Contact Message Locally
function saveLocalMessage(msg) {
  try {
    let messages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      const raw = fs.readFileSync(MESSAGES_FILE, 'utf8');
      messages = JSON.parse(raw || '[]');
    }
    msg.id = Date.now().toString();
    msg.timestamp = new Date().toISOString();
    messages.push(msg);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    return true;
  } catch (err) {
    console.error('Error saving message locally:', err);
    return false;
  }
}

/* ==========================================================================
   REST API ENDPOINTS (Supports MongoDB, MySQL, and Local Data)
   ========================================================================== */

// GET Profile & Credentials
app.get('/api/profile', (req, res) => {
  const data = getLocalPortfolioData();
  if (!data) return res.status(500).json({ error: 'Failed to load profile data' });
  res.json({
    profile: data.profile,
    skills: data.skills,
    experience: data.experience,
    education: data.education,
    databaseEngine: getDatabaseStatus()
  });
});

// GET Projects (MongoDB -> MySQL -> Local Data)
app.get('/api/projects', async (req, res) => {
  const { category } = req.query;

  // 1. Try MongoDB if connected
  if (getMongoStatus()) {
    try {
      let query = {};
      if (category && category !== 'All') {
        query.category = new RegExp(category, 'i');
      }
      const projects = await ProjectModel.find(query).sort({ createdAt: -1 });
      if (projects && projects.length > 0) return res.json(projects);
    } catch (err) {
      console.warn('MongoDB fetch notice, using fallback:', err.message);
    }
  }

  // 2. Try MySQL if connected
  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      let sql = 'SELECT * FROM projects';
      let params = [];
      if (category && category !== 'All') {
        sql += ' WHERE category LIKE ?';
        params.push(`%${category}%`);
      }
      const [rows] = await mysqlPool.query(sql, params);
      if (rows && rows.length > 0) return res.json(rows);
    } catch (err) {
      console.warn('MySQL fetch notice, using fallback:', err.message);
    }
  }

  // 3. Fallback to Local Database File
  const data = getLocalPortfolioData();
  if (!data) return res.status(500).json({ error: 'Failed to load projects' });
  
  let projects = data.projects;
  if (category && category !== 'All') {
    projects = projects.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }
  res.json(projects);
});

// GET Single Project Detail by ID
app.get('/api/projects/:id', async (req, res) => {
  if (getMongoStatus()) {
    try {
      const project = await ProjectModel.findById(req.params.id);
      if (project) return res.json(project);
    } catch (e) { /* ignore invalid mongo id */ }
  }

  const data = getLocalPortfolioData();
  if (!data) return res.status(500).json({ error: 'Failed to load project' });

  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project);
});

// POST Create Project (MongoDB & MySQL Support)
app.post('/api/projects', async (req, res) => {
  const { title, category, tags, image, summary, description, github } = req.body;
  if (!title || !category || !summary || !description) {
    return res.status(400).json({ error: 'Title, category, summary, and description are required.' });
  }

  if (getMongoStatus()) {
    try {
      const newProj = new ProjectModel({ title, category, tags, image, summary, description, github });
      await newProj.save();
      return res.status(201).json({ success: true, engine: 'MongoDB', project: newProj });
    } catch (err) {
      return res.status(500).json({ error: 'MongoDB save failed: ' + err.message });
    }
  }

  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      const [result] = await mysqlPool.query(
        'INSERT INTO projects (title, category, summary, description, github, image) VALUES (?, ?, ?, ?, ?, ?)',
        [title, category, summary, description, github || '', image || '']
      );
      return res.status(201).json({ success: true, engine: 'MySQL', insertId: result.insertId });
    } catch (err) {
      return res.status(500).json({ error: 'MySQL save failed: ' + err.message });
    }
  }

  // Local File DB Save
  const data = getLocalPortfolioData();
  const newProj = {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    category,
    tags: tags || [],
    image: image || '/assets/zero_net_navigator.png',
    summary,
    description,
    github: github || 'https://github.com/Arshani-cpu'
  };
  data.projects.unshift(newProj);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json({ success: true, engine: 'Local DB', project: newProj });
});

// GET Certifications
app.get('/api/certifications', (req, res) => {
  const data = getLocalPortfolioData();
  if (!data) return res.status(500).json({ error: 'Failed to load certifications' });
  res.json(data.certifications);
});

// POST Contact Form Submission
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide Name, Email, and Message.' });
  }

  // 1. Try MongoDB
  if (getMongoStatus()) {
    try {
      const newMsg = new MessageModel({ name, email, subject, message });
      await newMsg.save();
      return res.json({ success: true, engine: 'MongoDB', message: 'Thank you! Message saved to MongoDB.' });
    } catch (err) {
      console.error('MongoDB contact save error:', err);
    }
  }

  // 2. Try MySQL
  const mysqlPool = getMySQLPool();
  if (mysqlPool) {
    try {
      await mysqlPool.query(
        'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        [name, email, subject || '', message]
      );
      return res.json({ success: true, engine: 'MySQL', message: 'Thank you! Message saved to MySQL.' });
    } catch (err) {
      console.error('MySQL contact save error:', err);
    }
  }

  // 3. Fallback Local File DB
  const ok = saveLocalMessage({ name, email, subject, message });
  if (ok) {
    res.json({ success: true, engine: 'Local DB', message: 'Thank you! Message saved successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to save message.' });
  }
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Arshani's Full-Stack Portfolio running at http://localhost:${PORT}`);
  console.log(`   Database Status: ${getDatabaseStatus()}`);
  console.log(`====================================================`);
});
