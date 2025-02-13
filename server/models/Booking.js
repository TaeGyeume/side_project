const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['flight', 'accommodation', 'tourTicket', 'travelItem'] // 상품 유형
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type' // 참조할 상품 모델
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: function () {
        return this.type === 'accommodation';
      } // 숙소 예약 시 필수
    },
    startDate: {type: Date}, // 이용 시작일
    endDate: {type: Date}, // 이용 종료일
    count: {type: Number, default: 0, required: true}, // 개수
    merchant_uid: {type: String, required: true},
    totalPrice: {type: Number, required: true}, // 총 결제 금액
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // User 컬렉션 참조
    },
    reservationInfo: {
      name: {type: String},
      email: {type: String},
      phone: {type: String},
      address: {type: String}
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELED'],
      default: 'PENDING'
    }, // 결제 상태
    createdAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    },
    updatedAt: {
      type: Date,
      default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
    }
  },
  {timestamps: false}
);

module.exports = mongoose.model('Booking', bookingSchema);
