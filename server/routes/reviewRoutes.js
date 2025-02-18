const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/create', upload, reviewController.createReview);

router.get('/:productId', reviewController.getReviews);

module.exports = router;
