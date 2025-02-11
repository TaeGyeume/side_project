const tourTicketBookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await tourTicketBookingService.createBooking(bookingData);
    res.status(201).json({message: '예약이 성공적으로 생성되었습니다.', booking});
  } catch (error) {
    console.error('예약 생성 오류:', error);
    res.status(500).json({message: '예약 생성 중 오류 발생'});
  }
};

exports.verifyTourTicketPayment = async (req, res) => {
  try {
    const {imp_uid, merchant_uid} = req.body;
    const result = await tourTicketBookingService.verifyTourTicketPayment({
      imp_uid,
      merchant_uid
    });

    res.status(result.status).json({message: result.message, booking: result.booking});
  } catch (error) {
    console.error('결제 검증 오류:', error);
    res.status(500).json({message: '결제 검증 중 오류 발생'});
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const {bookingId} = req.params;
    const result = await tourTicketBookingService.cancelBooking(bookingId);

    res.status(result.status).json({message: result.message});
  } catch (error) {
    console.error('예약 취소 오류:', error);
    res.status(500).json({message: '예약 취소 중 오류 발생'});
  }
};
