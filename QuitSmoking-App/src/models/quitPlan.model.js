const mongoose = require('mongoose');

const quitPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coach_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  goal: Date,
  start_date: Date,
  status: {
  type: String,
  enum: ['ongoing', 'completed', 'cancelled']
},
  note: String
});

const QuitPlan = mongoose.model('QuitPlan', quitPlanSchema);
module.exports = QuitPlan;