const express = require('express');
const router = express.Router();
const {
  createReservation,
  getUserReservations
} = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

// 🎫 예약 생성 (로그인 필요)
router.post('/', authMiddleware, createReservation);

// 🎫 사용자의 모든 예약 조회
router.get('/', authMiddleware, getUserReservations);

module.exports = router;
