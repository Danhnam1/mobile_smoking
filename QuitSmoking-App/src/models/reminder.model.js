const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  remind_at: Date,
  is_recurring: Boolean,
  repeat_pattern: String,
  created_at: { type: Date, default: Date.now }
});
const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;