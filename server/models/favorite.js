const mongoose = require('mongoose');

// 즐겨찾기 스키마 정의
const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // 사용자 모델을 참조
      required: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
      // 'Accommodation', 'TourTicket', 'TravelItem' 등 다양한 모델을 참조할 수 있도록 설정
    },
    itemType: {
      type: String,
      enum: ['Accommodation', 'TourTicket', 'TravelItem'], // 즐겨찾기된 아이템 타입
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {timestamps: true} // 자동으로 생성일자와 업데이트일자 추가
);

// 모델 정의
module.exports = mongoose.model('Favorite', FavoriteSchema);
