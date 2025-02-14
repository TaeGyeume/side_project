const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/authMiddleware'); // 인증 미들웨어

// 즐겨찾기 추가 또는 삭제 (토글)
router.post('/toggle', authMiddleware, favoriteController.toggleFavorite);

// 사용자 즐겨찾기 목록 조회
router.get('/', authMiddleware, favoriteController.getUserFavorites);

module.exports = router;
