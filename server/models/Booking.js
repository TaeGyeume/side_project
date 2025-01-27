const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    type: {
      // 예약 유형
      type: String,
      required: true,
      enum: ['flight', 'accommodation', 'TourTicket'] // 각자 작성한 테이블 이름으로 하면됨(똑같이 작성해야 됨)
    },
    productId: {
      // 참조하는 상품 ID
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type'
    },
    startDate: {type: Date, required: true}, // 이용 시작일
    endDate:{type: Date, required: true}, // 이용 종료일
    adults: {type: Number, default: 0}, // 성인 인원
    children: {type: Number, default: 0}, // 소아 인원
    totalPrice: {type: Number, required: true}, // 총 결제 금액
    reservationInfo: {
      // 예약자 정보
      name: {type: String, required: true},
      email: {type: String, required: true},
      phone: {type: String, required: true}
    },
    paymentMethod: {type: String, required: true}, // 결제 방법
    paymentStatus: {type: String, default: 'COMPLETED'}, // 결제 상태(완료, 취소 둘 중 하나)
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    },
    updatedAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    }
  },

  {timestamps: false} // 이거 T하면 UTC 시간으로 저장됨
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
