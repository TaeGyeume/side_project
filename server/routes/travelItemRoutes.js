const express = require('express');
const router = express.Router();
const travelItemController = require('../controllers/travelItemController');
const upload = require('../middleware/uploadMiddleware');

// ✅ 상품 등록 API (POST 요청)
router.post('/create', upload, travelItemController.createTravelItem);
// 🔹 최상위 카테고리 조회
router.get('/topCategories', travelItemController.getTopLevelCategories);
// 🔹 특정 카테고리의 하위 카테고리 조회
router.get('/subCategories/:categoryId', travelItemController.getSubCategories);
// 🔹 특정 카테고리의 상품 조회
router.get('/byCategory/:categoryId', travelItemController.getItemsByCategory);
// 🔹 모든 카테고리 조회 API
router.get('/allCategories', travelItemController.getAllCategories);

module.exports = router;
