const tourTicketBookingService = require('../../../services/booking/tourTicket/tourTicketBookingService');

exports.createTourTicketBooking = async (req, res) => {
  try {
    const booking = await tourTicketBookingService.createTourTicketBooking(req.body);
    res.status(201).json({message: '투어.티켓 예약이 완료되었습니다.', booking});
  } catch (error) {
    console.error('예약 생성 오류:', error);
    res.status(500).json({message: '서버 오류 발생'});
  }
};

exports.getTourTicketBookingById = async (req, res) => {
  try {
    const booking = await tourTicketBookingService.getTourTicketBookingById(
      req.params.bookingId
    );
    if (!booking) {
      return res.status(404).json({message: '예약 정보를 찾을 수 없습니다.'});
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('예약 조회 오류:', error);
    res.status(500).json({message: '서버 오류 발생'});
  }
};

exports.getUserTourTicketBookings = async (req, res) => {
  try {
    const bookings = await tourTicketBookingService.getUserTourTicketBookings(
      req.params.userId
    );
    res.status(200).json(bookings);
  } catch (error) {
    console.error('유저 예약 조회 오류:', error);
    res.status(500).json({message: '서버 오류 발생'});
  }
};

exports.cancelTourTicketBooking = async (req, res) => {
  try {
    const result = await tourTicketBookingService.cancelTourTicketBooking(
      req.params.bookingId
    );
    res.status(result.status).json({message: result.message});
  } catch (error) {
    console.error('예약 취소 오류:', error);
    res.status(500).json({message: '서버 오류 발생'});
  }
};

exports.verifyTourTicketPayment = async (req, res) => {
  try {
    const {imp_uid, merchant_uid} = req.body; // 프론트에서 받은 결제 정보

    const result = await tourTicketBookingService.verifyTourTicketPayment({
      imp_uid,
      merchant_uid
    });

    res.status(result.status).json({message: result.message, booking: result.booking});
  } catch (error) {
    console.error('결제 검증 오류:', error);
    res.status(500).json({message: '서버 오류 발생'});
  }
};
