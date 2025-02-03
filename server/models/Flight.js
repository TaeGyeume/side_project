const mongoose = require('mongoose');

// ✈️ 항공편 정보 스키마 정의
const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true }, // 항공사 이름 (예: 대한항공, 아시아나)
    airlineLogo: { type: String, required: true }, // 항공사 로고 URL
    flightNumber: { type: String, required: true, unique: true }, // 항공편 번호
    departure: {
      airport: { type: String, required: true }, // 출발 공항 코드 (예: GMP)
      city: { type: String, required: true }, // 출발 도시
      time: { type: Date, required: true } // 출발 시간
    },
    arrival: {
      airport: { type: String, required: true }, // 도착 공항 코드 (예: CJU)
      city: { type: String, required: true }, // 도착 도시
      time: { type: Date, required: true } // 도착 시간
    },
    flightDuration: { type: String, required: true }, // 비행 소요 시간 (예: "1시간 10분")
    seatClass: { type: String, required: true, default: "이코노미" }, // 좌석 등급 (예: "할인석", "이코노미")
    price: { type: Number, required: true }, // 항공권 가격
    isDiscounted: { type: Boolean, default: false }, // 할인 여부
    seatsAvailable: { type: Number, required: true } // 예약 가능한 좌석 수
  },
  { timestamps: true }
);

// ✈️ Flight 모델 생성
module.exports = mongoose.model('Flight', flightSchema);
