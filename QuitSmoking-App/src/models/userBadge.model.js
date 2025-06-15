const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
  granted_date: Date
});

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);
module.exports = UserBadge;