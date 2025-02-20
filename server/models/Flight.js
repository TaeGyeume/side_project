const mongoose = require('mongoose');

// 항공편 정보 스키마 정의
const flightSchema = new mongoose.Schema(
  {
    airline: {type: String, required: true},
    airlineKorean: {type: String, required: false},
    airlineHomepageUrl: {type: String},

    departure: {
      airport: {type: String, required: true},
      city: {type: String, required: true},
      date: {
        type: Date,
        default: () => new Date(Date.now() + 9 * 60 * 60 * 1000),
        required: true
      },
      time: {type: String, required: true} // 원본 그대로 유지 (HHmm 형식)
    },

    arrival: {
      airport: {type: String, required: true},
      city: {type: String, required: true},
      date: {
        type: Date,
        default: () => new Date(Date.now() + 9 * 60 * 60 * 1000),
        required: true
      },
      time: {type: String, required: true} // 원본 그대로 유지 (HHmm 형식)
    },

    flightNumber: {type: String, required: true, unique: false},
    operatingDays: {type: [String], required: true},

    price: {type: Number, required: true}, // 가격 필드 추가
    seatsAvailable: {type: Number, required: true}, // 좌석 정보 필드 추가
    seatClass: {type: String, required: true}, // 좌석 등급 추가 (비즈니스석, 일반석, 특가석)

    totalCount: {type: Number},
    numOfRows: {type: Number},
    pageNo: {type: Number}
  },
  {timestamps: true}
);

module.exports = mongoose.model('flight', flightSchema); // F로 하면 평탄화(populate) 때문에 예약 조회가 안 됨
