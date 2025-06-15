const mongoose = require('mongoose');

const userMembershipSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPackage' },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  payment_date: Date,
  expire_date: Date,
  status: {
  type: String,
  enum: ['active', 'expired', 'cancelled']
}
});

const UserMembership = mongoose.model('UserMembership', userMembershipSchema);
module.exports = UserMembership;