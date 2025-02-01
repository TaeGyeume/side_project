const mongoose = require('mongoose');

// 🎫 항공 예약 스키마 정의
const reservationSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // 예약한 사용자
    flight: {type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true}, // 예약한 항공편
    passengers: [
      // 탑승 승객 정보 (여러 명 가능)
      {
        name: {type: String, required: true},
        age: {type: Number, required: true},
        passportNumber: {type: String, required: true}
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }, // 예약 상태
    totalPrice: {type: Number, required: true} // 최종 결제 금액
  },
  {timestamps: true}
);

// 🎫 Reservation 모델 생성
module.exports = mongoose.model('Reservation', reservationSchema);
