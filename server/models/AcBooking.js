const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // 예약한 사용자
    ref: 'User',
    required: true
  },
  accommodation: {
    type: mongoose.Schema.Types.ObjectId, // 예약한 숙소
    ref: 'Accommodation',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId, // 예약한 객실
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date, // 체크인 날짜
    required: true
  },
  checkOutDate: {
    type: Date, // 체크아웃 날짜
    required: true
  },
  guests: {
    type: Number, // 투숙 인원 수
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number, // 총 결제 금액
    required: true
  },
  paymentStatus: {
    type: String, // 결제 상태
    enum: ['Pending', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String, // 예약 상태
    enum: ['Confirmed', 'Cancelled', 'Completed'],
    default: 'Confirmed'
  },
  createdAt: {
    type: Date, // 예약 생성 날짜
    default: Date.now
  }
});

// 체크인 날짜가 체크아웃 날짜보다 늦으면 저장되지 않도록 설정
BookingSchema.pre('save', function (next) {
  if (this.checkInDate >= this.checkOutDate) {
    return next(new Error('체크아웃 날짜는 체크인 날짜보다 늦어야 합니다.'));
  }
  next();
});

// 예약 내역 검색 속도를 향상시키기 위한 인덱스 추가
BookingSchema.index({user: 1, checkInDate: -1});
BookingSchema.index({accommodation: 1, checkInDate: -1});

module.exports = mongoose.model('Booking', BookingSchema);
