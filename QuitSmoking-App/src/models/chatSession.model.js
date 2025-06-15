const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coach_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  status: {
  type: String,
  enum: ['open', 'closed', 'archived']
},
  last_active_at: Date,
  note: String
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;