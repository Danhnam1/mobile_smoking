const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: String,
  type: String,
  date: Date,
  description: String,
  proOnly: {
    type: Boolean,
    default: false
  },
  condition: {
    type: {
      type: String,
      enum: ['no_smoke_days', 'money_saved'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['days', 'vnd'],
      required: true
    },
    description: String
  }
});

const Badge = mongoose.model('Badge', badgeSchema);
module.exports = Badge;