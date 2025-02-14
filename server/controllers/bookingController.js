// const bookingService = require('../services/bookingService');

// exports.createBooking = async (req, res) => {
//   try {
//     const bookingData = req.body;
//     const booking = await bookingService.createBooking(bookingData);
//     res.status(201).json({message: '예약이 성공적으로 생성되었습니다.', booking});
//   } catch (error) {
//     console.error('예약 생성 오류:', error);
//     res.status(500).json({message: '예약 생성 중 오류 발생'});
//   }
// };

// exports.verifyPayment = async (req, res) => {
//   try {
//     const {imp_uid, merchant_uid} = req.body;
//     const result = await bookingService.verifyPayment({imp_uid, merchant_uid});

//     res.status(result.status).json({message: result.message, booking: result.booking});
//   } catch (error) {
//     console.error('결제 검증 오류:', error);
//     res.status(500).json({message: '결제 검증 중 오류 발생'});
//   }
// };

// exports.cancelBooking = async (req, res) => {
//   try {
//     const {bookingId} = req.params;
//     const {status, message, booking} = await bookingService.cancelBooking(bookingId);

//     return res.status(status).json({message, booking});
//   } catch (error) {
//     console.error('예약 취소 오류:', error);
//     res.status(500).json({message: '예약 취소 중 오류 발생'});
//   }
// };

// exports.getMyBookings = async (req, res) => {
//   console.log('📌📌 현재 요청된 사용자 정보:', req.user);

//   if (!req.user || !req.user.id) {
//     return res.status(401).json({message: '사용자 정보가 없습니다.'});
//   }

//   try {
//     console.log('🔍 예약 조회를 위한 사용자 ID:', req.user.id);
//     const {status, data, message} = await bookingService.getUserBookings(req.user.id);

//     if (status !== 200) {
//       return res.status(status).json({message});
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     console.error('🚨📌 예약 내역 조회 오류:', error);
//     res.status(500).json({message: '서버 오류 발생'});
//   }
// };

const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const {types, productIds, counts, totalPrice, userId, reservationInfo, merchant_uid} =
      req.body;

    const bookingData = {
      types,
      productIds,
      counts,
      totalPrice,
      userId,
      reservationInfo,
      merchant_uid
    };

    const result = await bookingService.createBooking(bookingData);
    res.status(201).json(result);
  } catch (error) {
    console.error('예약 생성 오류:', error);
    res.status(500).json({message: '예약 생성 오류'});
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {imp_uid, merchant_uid} = req.body;
    const result = await bookingService.verifyPayment({imp_uid, merchant_uid});
    res.status(result.status).json(result);
  } catch (error) {
    console.error('결제 검증 오류:', error);
    res.status(500).json({message: '결제 검증 오류'});
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const {bookingIds} = req.body;
    const result = await bookingService.cancelBooking(bookingIds);
    res.status(result.status).json(result);
  } catch (error) {
    console.error('예약 취소 오류:', error);
    res.status(500).json({message: '예약 취소 중 오류 발생'});
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await bookingService.getUserBookings(userId);
    res.status(result.status).json(result.data || {message: result.message});
  } catch (error) {
    console.error('예약 조회 오류:', error);
    res.status(500).json({message: '서버 오류'});
  }
};
