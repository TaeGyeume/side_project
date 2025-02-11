// 결제 이력 저장 컬렉션

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  bookingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true}, // 예약과 연결
  imp_uid: {type: String, required: true, unique: true}, // 포트원 거래 ID
  merchant_uid: {type: String, required: true, unique: true}, // 예약과 연결
  bookingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  amount: {type: Number, required: true}, // 결제 금액
  status: {type: String, enum: ['PAID', 'FAILED', 'CANCELED'], default: 'PAID'}, // 결제 상태
  paymentMethod: {type: String, enum: ['card', 'vbank', 'trans'], required: true}, // 결제 수단
  paidAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)},
  receiptUrl: {type: String} // 영수증 URL
});

module.exports = mongoose.model('Payment', PaymentSchema);
