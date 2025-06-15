const mongoose = require('mongoose');

const coachMessageSchema = new mongoose.Schema({
  session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  sent_at: Date,
  is_read: Boolean
});

const coachMessage = mongoose.model('CoachMessage', coachMessageSchema);
module.exports = coachMessage;