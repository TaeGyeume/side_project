const bookingSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['flight', 'accommodation', 'tourTicket'] // 상품 유형
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type' // 참조할 상품 모델
    },
    startDate: {type: Date, required: true}, // 이용 시작일
    endDate: {type: Date, required: true}, // 이용 종료일
    adults: {type: Number, default: 0}, // 성인 인원
    children: {type: Number, default: 0}, // 소아 인원
    totalPrice: {type: Number, required: true}, // 총 결제 금액
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' // User 컬렉션 참조
    },
    reservationInfo: {
      // 기본적으로는 userId를 참조하여 정보를 채우지만, 수정된 경우 저장
      name: {type: String}, // 수정된 이름
      email: {type: String}, // 수정된 이메일
      phone: {type: String} // 수정된 전화번호
    },
    paymentMethod: {type: String, required: true}, // 결제 방법
    paymentStatus: {type: String, default: 'COMPLETED'}, // 결제 상태
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
