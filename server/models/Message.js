const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: String,
  read: { type: Boolean, default: false },
  senderId: String,
  senderName: String,
  senderRole: String,
  recipientId: String,
  recipientName: String,
  subject: String,
  content: String,
  studentName: String
});

module.exports = mongoose.model('Message', messageSchema);
