const mongoose = require('mongoose');

const coachUserSchema = new mongoose.Schema({
  coach_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: Date,
  status: {
  type: String,
  enum: ['active', 'blocked', 'pending']
},
  note: String
});

const CoachUser = mongoose.model('CoachUser', coachUserSchema);
module.exports = CoachUser;