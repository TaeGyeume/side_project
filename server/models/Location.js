const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // 도시명 (서울, 제주 등)
  country: {
    type: String,
    required: true
  }, // 국가명 (대한민국 등)
  latitude: {
    type: Number,
    required: true
  }, // 위도
  longitude: {
    type: Number,
    required: true
  }, // 경도
  popularPlaces: [
    {
      type: String
    }
  ], // 인기 여행지 (예: "명동", "한강공원")
  createdAt: {
    type: Date,
    default: Date.now
  } // 생성 날짜
});

// 위치 검색을 위한 인덱스 추가
LocationSchema.index({name: 'text'}); // 도시명 검색 최적화

module.exports = mongoose.model('Location', LocationSchema);
