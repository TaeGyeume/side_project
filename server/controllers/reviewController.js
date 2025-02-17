const ReviewService = require('../services/reviewService');

exports.createReview = async (req, res) => {
  try {
    const review = await ReviewService.createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await ReviewService.getReviewsByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await ReviewService.updateReview(req.params.id, req.body);
    res.json(review);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await ReviewService.deleteReview(req.params.id);
    res.json({message: '리뷰가 삭제되었습니다.'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
