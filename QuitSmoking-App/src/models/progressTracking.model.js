const mongoose = require('mongoose');

const progressTrackingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan' },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitStage' },
  date: Date,
  cigarette_count: Number,
  note: String
});

const progressTracking = mongoose.model('ProgressTracking', progressTrackingSchema);
module.exports = progressTracking;