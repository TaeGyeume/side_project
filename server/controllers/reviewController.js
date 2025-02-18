const reviewService = require('../services/reviewService');
const upload = require('../middleware/uploadMiddleware');

exports.createReview = async (req, res) => {
  try {
    const {bookingId, productId, rating, content} = req.body;
    const imagePaths = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];

    const newReview = await reviewService.createReview({
      bookingId,
      productId,
      rating,
      content,
      images: imagePaths
    });
    
    res.status(201).json(newReview);
  } catch (error) {
    console.error('리뷰 등록 오류:', error);
    res.status(400).json({message: error.message});
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
  upload(req, res, async err => {
    if (err) return res.status(400).json({message: err.message});
    try {
      const review = await ReviewService.updateReview(req.params.id, req.body, req.files);
      res.json(review);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  });
};

exports.deleteReview = async (req, res) => {
  try {
    await ReviewService.deleteReview(req.params.id);
    res.json({message: '리뷰가 삭제되었습니다.'});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
