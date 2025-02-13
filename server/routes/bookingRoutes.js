const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// 예약 생성
router.post('/create', bookingController.createBooking);

// 예약 취소
router.post('/cancel/:bookingId', authMiddleware, bookingController.cancelBooking);

// 결제 검증
router.post('/verify-payment', bookingController.verifyPayment);

// 내 예약 목록
router.get('/my', authMiddleware, bookingController.getMyBookings);

module.exports = router;
