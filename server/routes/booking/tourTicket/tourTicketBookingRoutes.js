const express = require('express');
const router = express.Router();
const tourTicketBookingController = require('../../../controllers/booking/tourTicket/tourTicketBookingController');

// 투어.티켓 예약 생성
router.post('/create', tourTicketBookingController.createTourTicketBooking);

// 특정 예약 조회
router.get('/:bookingId', tourTicketBookingController.getTourTicketBookingById);

// 특정 유저의 예약 목록 조회
router.get('/user/:userId', tourTicketBookingController.getUserTourTicketBookings);

// 예약 취소
router.delete('/:bookingId', tourTicketBookingController.cancelTourTicketBooking);

// 결제 검증
router.post('/verify-payment', tourTicketBookingController.verifyTourTicketPayment);

module.exports = router;
