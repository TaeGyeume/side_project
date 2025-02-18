const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Booking = require('../models/Booking');

exports.createReview = async data => {
  const booking = await Booking.findById(data.bookingId);

  if (!booking || booking.paymentStatus !== 'CONFIRMED') {
    throw new Error('구매 확정된 예약만 리뷰 작성이 가능합니다!');
  }

  return await Review.create(data);
};

exports.getReviewsByProduct = async productId => {
  return await Review.find({productId});
};

exports.updateReview = async (id, data) => {
  return await Review.findByIdAndUpdate(id, data, {new: true});
};

exports.deleteReview = async id => {
  await Review.findByIdAndDelete(id);
  await Comment.deleteMany({reviewId: id});
};
