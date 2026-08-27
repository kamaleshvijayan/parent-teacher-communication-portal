const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  dateKey: { type: String, required: true },
  status: { type: String, enum: ['present'], default: 'present' },
  confidence: { type: Number, required: true },
  source: { type: String, default: 'face-recognition' }
}, { timestamps: true });

attendanceSchema.index({ studentId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
