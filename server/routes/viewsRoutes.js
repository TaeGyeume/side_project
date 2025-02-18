const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();

// ✅ 인기 상품 조회 (조회수 높은 순)
router.get('/popular-products', viewsController.getPopularProducts);

module.exports = router;
