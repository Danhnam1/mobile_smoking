// models/payment.model.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPackage',
    required: true
  },
  payment_method: {
    type: String,
    enum: ['paypal', 'momo', 'credit_card', 'bank_transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transaction_id: {
    type: String,
    default: null
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
