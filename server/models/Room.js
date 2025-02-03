const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  accommodation: {
    type: mongoose.Schema.Types.ObjectId, // 해당 객실이 속한 숙소와 연결
    ref: 'Accommodation',
    required: true
  },
  name: {
    type: String, // 객실명 (예: 디럭스룸, 스탠다드룸)
    required: true
  },
  description: {
    type: String // 객실 설명
  },
  pricePerNight: {
    type: Number, // 1박당 가격
    required: true
  },
  maxGuests: {
    type: Number, // 최대 숙박 가능 인원
    required: true
  },
  images: [
    {
      type: String // 객실 이미지 URL 리스트
    }
  ],
  amenities: [
    {
      type: String // 객실 편의시설 리스트 (예: Wifi, TV, 에어컨 등)
    }
  ],
  available: {
    type: Boolean, // 객실 예약 가능 여부
    default: true
  },
  availableCount: {
    type: Number, // 남은 객실 개수 (예약 시 감소, 취소 시 증가)
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date(Date.now() + 9 * 60 * 60 * 1000) // KST
  }
});

// 가격 검색 최적화를 위한 인덱스 추가
RoomSchema.index({pricePerNight: 1});

module.exports = mongoose.model('Room', RoomSchema);
