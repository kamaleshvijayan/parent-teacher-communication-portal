const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  subject: String,
  type: { type: String }, // e.g. test, quiz, project, homework
  score: Number,
  maxScore: Number,
  grade: String,
  date: String
});

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  grade: String,
  className: String,
  email: String, // Parent's email
  teacherId: String,
  teacherName: String,
  parentIds: [String],
  attendance: { type: Number, default: 100 },
  behavior: String,
  recentMarks: [markSchema]
});

module.exports = mongoose.model('Student', studentSchema);
