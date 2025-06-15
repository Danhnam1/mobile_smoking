const mongoose = require('mongoose');

const smokingStatusSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan' },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitStage' },
  record_date: Date,
  cigarette_count: Number,
  time_of_smoking: Date,
  money_spent: Number,
  health_note: String
});

const SmokingStatus = mongoose.model('SmokingStatus', smokingStatusSchema);
module.exports = SmokingStatus;