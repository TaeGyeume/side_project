const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    reviewId: {type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true}, // 리뷰 참조
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}, // 작성자
    content: {type: String, required: true}, // 댓글 내용
    createdAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)},
    updatedAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)}
  },
  {timestamps: false}
);

module.exports = mongoose.model('Comment', commentSchema);
