const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, enum: ['general', 'event', 'urgent'] },
    authorName: { type: String, required: true },
    authorId: { type: String, required: true },
    timestamp: { type: String, required: true }
});

module.exports = mongoose.model('Announcement', announcementSchema);
