const express = require('express');
const router = express.Router();
const tourTicketBookingController = require('../../../controllers/booking/tourTicket/tourTicketBookingController');

// 투어.티켓 예약 생성
router.post('/create', tourTicketBookingController.createBooking);

// 예약 취소
router.post('/cancel/:bookingId', tourTicketBookingController.cancelBooking);

// 결제 검증
router.post('/verify-payment', tourTicketBookingController.verifyTourTicketPayment);

module.exports = router;
