const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  image: { type: String },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  github: { type: String, default: 'https://github.com/Arshani-cpu' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
