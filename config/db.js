/**
 * DATABASE CONFIGURATION FOR MONGODB & MYSQL
 * Supports MongoDB (Mongoose), MySQL (mysql2), and Local JSON Database Engine
 */

const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

let mongoDbConnected = false;
let mysqlPool = null;

// Connect to MongoDB if MONGO_URI is set
async function connectMongoDB() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      mongoDbConnected = true;
      console.log('✅ Connected to MongoDB Database successfully.');
    } catch (err) {
      console.warn('⚠️ MongoDB connection warning:', err.message);
    }
  }
}

// Connect to MySQL if MYSQL_HOST is set
async function connectMySQL() {
  if (process.env.MYSQL_HOST) {
    try {
      mysqlPool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'arshani_portfolio',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      // Test MySQL connection
      const connection = await mysqlPool.getConnection();
      console.log('✅ Connected to MySQL Database successfully.');
      connection.release();
    } catch (err) {
      console.warn('⚠️ MySQL connection warning:', err.message);
    }
  }
}

function getDatabaseStatus() {
  if (mongoDbConnected) return 'MongoDB (Active)';
  if (mysqlPool) return 'MySQL (Active)';
  return 'Local Data Engine (Zero-Config)';
}

module.exports = {
  connectMongoDB,
  connectMySQL,
  getDatabaseStatus,
  getMongoStatus: () => mongoDbConnected,
  getMySQLPool: () => mysqlPool
};
