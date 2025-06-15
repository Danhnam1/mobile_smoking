const mongoose = require('mongoose');

  const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coach_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan' },
  rating: Number,
  comment: String,
  created_at: Date,
  updated_at: Date,
  is_deleted: Boolean
});
const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;