const bookingService = require('../services/bookingService');

exports.createBooking = async (req, res) => {
  try {
    const {
      types,
      productIds,
      counts,
      totalPrice,
      userId,
      reservationInfo,
      merchant_uid,
      roomIds,
      startDates,
      endDates,
      discountAmount,
      finalPrice,
      couponId
    } = req.body;

    const bookingData = {
      types,
      productIds,
      counts,
      totalPrice,
      userId,
      reservationInfo,
      merchant_uid,
      roomIds,
      startDates,
      endDates,
      discountAmount,
      finalPrice,
      couponId
    };

    console.log('📌 [서버] 변환된 데이터:', bookingData);
    const result = await bookingService.createBooking(bookingData);

    if (result.status === 200 && result.booking) {
      bookingService.scheduleAutoConfirm(result.booking._id, result.booking.createdAt);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('예약 생성 오류:', error);
    res.status(500).json({message: '예약 생성 오류'});
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    console.log('📌 [서버] 결제 검증 요청 도착:', req.body);
    const {imp_uid, merchant_uid, couponId, userId} = req.body;

    if (!imp_uid || !merchant_uid) {
      console.error('❌ [서버] 필수 결제 정보가 없습니다.');
      return res.status(400).json({message: '필수 결제 정보가 없습니다.'});
    }
    // ✅ 쿠폰 ID와 사용자 ID를 추가하여 결제 검증 요청
    const result = await bookingService.verifyPayment({
      imp_uid,
      merchant_uid,
      couponId,
      userId
    });

    res.status(result.status).json({message: result.message, booking: result.booking});
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

exports.confirmBooking = async (req, res) => {
  const {bookingId} = req.params;
  const result = await bookingService.confirmBooking(bookingId);
  res.status(result.status).json(result);
};
