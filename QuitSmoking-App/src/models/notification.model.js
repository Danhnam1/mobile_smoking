const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  sent_at: Date,
  type: String
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;