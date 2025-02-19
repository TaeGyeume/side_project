const reviewService = require('../services/reviewService');
const upload = require('../middleware/uploadMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

exports.createReview = async (req, res) => {
  try {
    const {userId, productId, bookingId, rating, content, images} = req.body;

    if (!userId || !bookingId || !productId) {
      return res
        .status(400)
        .json({message: '리뷰 등록 오류: userId, bookingId, productId가 필요합니다.'});
    }

    // 주문번호까지 포함하여 기존 리뷰 여부 체크
    const hasReview = await reviewService.checkExistingReview(
      userId,
      productId,
      bookingId
    );

    if (hasReview) {
      return res
        .status(400)
        .json({message: '이미 해당 주문 건에 대한 리뷰를 작성하셨습니다!'});
    }

    // 새로운 리뷰 생성
    const newReview = await reviewService.createReview({
      userId,
      productId,
      bookingId,
      rating,
      content,
      images
    });
    res.status(201).json(newReview);
  } catch (error) {
    console.error('리뷰 등록 오류:', error);
    res.status(500).json({message: `리뷰 등록 오류: ${error.message}`});
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 좋아요 추가
exports.likeReview = async (req, res) => {
  const {reviewId} = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({message: '리뷰를 찾을 수 없습니다.'});

    if (review.likedBy.includes(userId)) {
      review.likes -= 1;
      review.likedBy = review.likedBy.filter(id => id.toString() !== userId);
    } else {
      review.likes += 1;
      review.likedBy.push(userId);
    }
    await review.save();
    res.json({likes: review.likes});
  } catch (err) {
    res.status(500).json({message: '좋아요 처리 중 오류 발생'});
  }
};

// 관리자 댓글 작성
exports.addComment = async (req, res) => {
  const {reviewId} = req.params;
  const {content} = req.body;
  const user = req.user;

  if (!user.isAdmin)
    return res.status(403).json({message: '관리자만 댓글을 작성할 수 있습니다.'});

  try {
    const comment = new Comment({reviewId, userId: user.id, content});
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({message: '댓글 작성 중 오류 발생'});
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  const {commentId} = req.params;
  try {
    await Comment.findByIdAndDelete(commentId);
    res.json({message: '댓글이 삭제되었습니다.'});
  } catch (err) {
    res.status(500).json({message: '댓글 삭제 중 오류 발생'});
  }
};

exports.updateReview = async (req, res) => {
  upload(req, res, async err => {
    if (err) return res.status(400).json({message: err.message});
    try {
      const review = await reviewService.updateReview(req.params.id, req.body, req.files);
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

// 댓글 작성 (관리자 인증)
exports.addComment = [
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const {reviewId} = req.params;
      const {userId, content} = req.body;
      const comment = await reviewService.addComment(reviewId, userId, content);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  }
];

// 댓글 삭제 (관리자 인증)
exports.deleteComment = [
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const {commentId} = req.params;
      await reviewService.deleteComment(commentId);
      res.json({message: '댓글이 삭제되었습니다.'});
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  }
];
