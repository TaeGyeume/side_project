const mongoose = require('mongoose');

// 게시물에 대한 스키마 정의
const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // 제목은 필수 항목
    trim: true, // 앞뒤 공백 제거
  },
  content: {
    type: String,
    required: false, // 내용은 선택 사항 (글을 쓰지 않고 이미지만 올릴 수도 있음)
  },
  media: {
    type: [String], // 이미지나 영상의 URL 배열
    required: true, // 이미지 또는 영상은 반드시 포함해야 함
    validate: [array => array.length > 0, '최소 하나의 이미지 또는 영상을 포함해야 합니다.'], // 유효성 검사
  },
  likes: {
    type: Number,
    default: 0, // 기본값: 좋아요 수는 0
  },
  comments: [
    {
      user: { type: String, required: true }, // 댓글 작성자
      comment: { type: String, required: true }, // 댓글 내용
      date: { type: Date, default: Date.now }, // 댓글 작성 날짜
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now, // 기본값: 현재 시간
  },
});

// 스키마를 모델로 변환하여 내보내기
module.exports = mongoose.model('Board', BoardSchema);
