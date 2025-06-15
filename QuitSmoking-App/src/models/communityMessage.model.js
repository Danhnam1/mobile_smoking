const mongoose = require('mongoose');

const communityMessageSchema = new mongoose.Schema({
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  created_at: { type: Date, default: Date.now },
  parent_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityMessage', default: null },
  type: {
    type: String,
    enum: ['message', 'reply'],
    default: 'message'
  },
});

const communityMessage = mongoose.model('CommunityMessage', communityMessageSchema); 
module.exports = communityMessage;