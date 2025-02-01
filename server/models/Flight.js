const mongoose = require('mongoose');

// ✈️ 항공편 정보 스키마 정의
const flightSchema = new mongoose.Schema(
  {
    airline: {type: String, required: true}, // 항공사 이름 (예: 대한항공, 아시아나)
    flightNumber: {type: String, required: true, unique: true}, // 항공편 번호
    departure: {
      airport: {type: String, required: true}, // 출발 공항 (예: ICN - 인천공항)
      city: {type: String, required: true}, // 출발 도시
      time: {type: Date, required: true} // 출발 시간
    },
    arrival: {
      airport: {type: String, required: true}, // 도착 공항 (예: JFK - 뉴욕공항)
      city: {type: String, required: true}, // 도착 도시
      time: {type: Date, required: true} // 도착 시간
    },
    price: {type: Number, required: true}, // 기본 항공권 가격
    seatsAvailable: {type: Number, required: true} // 예약 가능한 좌석 수
  },
  {timestamps: true}
);

// ✈️ Flight 모델 생성
module.exports = mongoose.model('Flight', flightSchema);
