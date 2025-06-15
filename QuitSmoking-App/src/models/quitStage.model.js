const mongoose = require('mongoose');

const quitStageSchema = new mongoose.Schema({
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan' },
  name: String,
  description: String,
  start_date: Date,
  end_date: Date,
  status: {
  type: String,
  enum: ['not_started', 'in_progress', 'completed', 'skipped']
}
});

const QuitStage = mongoose.model('QuitStage', quitStageSchema);
module.exports = QuitStage;