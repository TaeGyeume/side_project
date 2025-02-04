const mongoose = require('mongoose');

// ✈️ 항공편 정보 스키마 정의
const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true }, // 항공사 이름 (대한항공, 아시아나)
    airlineKorean: { type: String, required: true }, // 항공사(국문)
    airlineHomepageUrl: { type: String }, // 항공사 홈페이지

    departure: {
      airport: { type: String, required: true }, // 출발 공항 (예: 김포)
      city: { type: String, required: true }, // 출발 도시
      time: { type: String, required: true }, // 출발 시간 (0700)
      weekday: { type: String, required: true }, // 출발 요일 (예: 월요일)
    },

    arrival: {
      airport: { type: String, required: true }, // 도착 공항 (예: 김해)
      city: { type: String, required: true }, // 도착 도시
      time: { type: String, required: true }, // 도착 시간 (0755)
    },

    flightNumber: { type: String, required: true, unique: true }, // 항공편 번호 (KE1101)
    operatingDays: { type: [String], required: true }, // 운항 요일 리스트 (["일요일", "수요일", "금요일"])

    totalCount: { type: Number }, // 데이터 총 개수
    numOfRows: { type: Number }, // 열 개수
    pageNo: { type: Number } // 페이지 번호
  },
  { timestamps: true }
);

// ✈️ Flight 모델 생성
module.exports = mongoose.model('Flight', flightSchema);
