const mongoose = require('mongoose');

// 숙소 스키마 정의
const AccommodationSchema = new mongoose.Schema({
  name: {
    type: String, // 숙소명
    required: true
  },
  description: {
    type: String // 숙소 설명
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location', // 🔹 여행지(Location) 참조
    required: true
  },
  address: {type: String, required: true}, // 상세 주소
  coordinates: {
    type: {type: String, enum: ['Point'], default: 'Point'}, // GeoJSON 형식
    coordinates: {type: [Number], required: true, index: '2dsphere'} // 경도(lng), 위도(lat)
  },
  images: [
    {
      type: String // 숙소 이미지 URL 리스트
    }
  ],
  minPrice: {
    type: Number, // 숙소 내 최저 객실 가격
    default: 0,
    index: true
  },
  maxPrice: {
    type: Number, // 숙소 내 최고 객실 가격
    default: 0,
    index: true
  },
  amenities: [
    {
      type: String // 숙소 편의시설 리스트 (예: Wifi, 주차장, 조식 포함 등)
    }
  ],
  rating: {
    type: Number, // 숙소 평균 평점
    default: 0,
    index: true
  },
  category: {
    type: String, // 숙소 유형
    enum: ['Hotel', 'Pension', 'Resort', 'Motel'],
    required: true,
    index: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId, // 숙소 등록자
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date, // 숙소 등록 날짜
    default: Date.now
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }
  ]
});

// 위치 기반 검색을 위한 2dsphere 인덱스 추가
AccommodationSchema.index({coordinates: '2dsphere'});

module.exports = mongoose.model('Accommodation', AccommodationSchema);
