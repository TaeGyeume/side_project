const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, required: true}, // 상품 ID
    rating: {type: Number, required: true, min: 1.0, max: 5.0}, // 평점 (1 ~ 5)
    content: {type: String, required: true}, // 리뷰 내용
    images: [{type: String}], // 이미지 URL 배열
    createdAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)},
    updatedAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)}
  },
  {timestamps: false}
);

module.exports = mongoose.model('Review', reviewSchema);
