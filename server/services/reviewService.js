const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

exports.createReview = async reviewData => {
  const booking = await Booking.findById(reviewData.bookingId);

  try {
    if (!booking || booking.paymentStatus !== 'CONFIRMED') {
      throw new Error('구매 확정된 예약만 리뷰 작성이 가능합니다!');
    }

    const review = new Review({
      ...reviewData,
      userId: booking.userId
    });

    return await review.save();
  } catch (error) {
    throw new Error(`리뷰 등록 오류: ${error.message}`);
  }
};

exports.getReviewsByProduct = async productId => {
  console.log('📌 [서버] 리뷰 조회 서비스 호출 - productId:', productId);
  const reviews = await Review.find({productId});
  console.log('✅ [서버] 조회된 리뷰:', reviews);
  return reviews;
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
