const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// 예약 생성
router.post('/create', bookingController.createBooking);

// 예약 취소
router.post('/cancel/:bookingId', bookingController.cancelBooking);

// 결제 검증
router.post('/verify-payment', bookingController.verifyTourTicketPayment);

module.exports = router;
