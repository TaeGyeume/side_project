const Review = require('../models/Review');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

exports.createReview = async reviewData => {
  try {
    const newReview = new Review(reviewData);
    await newReview.save();
    return newReview;
  } catch (error) {
    console.error('리뷰 등록 오류:', error);
    throw new Error(`리뷰 등록 오류: ${error.message}`);
  }
};

exports.getReviewsByProduct = async productId => {
  try {
    const reviews = await Review.find({productId}).populate('userId', 'username');
    return reviews;
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    throw new Error(`리뷰 조회 오류: ${error.message}`);
  }
};

exports.checkExistingReview = async (userId, productId, bookingId) => {
  try {
    const existingReview = await Review.findOne({userId, productId, bookingId});
    return !!existingReview; // true or false 반환
  } catch (error) {
    console.error('리뷰 확인 오류:', error);
    throw new Error(`리뷰 확인 오류: ${error.message}`);
  }
};

exports.toggleLike = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('리뷰를 찾을 수 없습니다.');

  const index = review.likes.indexOf(userId);
  if (index === -1) {
    review.likes.push(userId);
  } else {
    review.likes.splice(index, 1);
  }
  await review.save();
  return review;
};

exports.updateReview = async (id, data, files) => {
  console.log('📌 [서버] 리뷰 수정 서비스 호출 - id:', id, 'data:', data);
  const imagePaths = files ? files.map(file => `/uploads/${file.filename}`) : [];
  const updatedData = {...data, images: imagePaths.length > 0 ? imagePaths : data.images};
  const review = await Review.findByIdAndUpdate(id, updatedData, {new: true});
  console.log('✅ [서버] 리뷰 수정 성공:', review);
  return review;
};

exports.deleteReview = async id => {
  console.log('📌 [서버] 리뷰 삭제 서비스 호출 - id:', id);
  await Review.findByIdAndDelete(id);
  await Comment.deleteMany({reviewId: id});
  console.log('✅ [서버] 리뷰 및 댓글 삭제 성공');
};

// 댓글 추가 (관리자만)
exports.addComment = async (reviewId, userId, content) => {
  const comment = new Comment({reviewId, userId, content});
  await comment.save();
  return comment;
};

// 댓글 삭제
exports.deleteComment = async commentId => {
  await Comment.findByIdAndDelete(commentId);
};
