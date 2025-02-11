const axios = require('axios');
const TourTicketBooking = require('../../../models/Booking');

// ✅ 포트원 API 키 & Secret
const PORTONE_API_KEY = '1672056586583577';
const PORTONE_API_SECRET =
  'CghTwEGdnY5PoEbZjUumPXh2hkCU5BQLkLY9DEjcor3jAj6IjVMBD6P4myOIz05Xy6iOcnsSalieSa8p';

// ✅ 포트원 Access Token 발급 (캐싱)
let accessTokenCache = null;
let tokenExpiresAt = 0;

const getPortOneToken = async () => {
  try {
    if (accessTokenCache && Date.now() < tokenExpiresAt) {
      return accessTokenCache;
    }

    const {data} = await axios.post('https://api.iamport.kr/users/getToken', {
      imp_key: PORTONE_API_KEY,
      imp_secret: PORTONE_API_SECRET
    });

    accessTokenCache = data.response.access_token;
    tokenExpiresAt = Date.now() + 1000 * 60 * 29; // 29분 캐싱

    return accessTokenCache;
  } catch (error) {
    console.error('포트원 Access Token 발급 오류:', error);
    throw new Error('결제 인증 실패');
  }
};

// ✅ 1️⃣ 예약 생성 (초기 상태 "COMPLETED")
exports.createTourTicketBooking = async data => {
  const {
    productId,
    startDate,
    endDate,
    adults,
    children,
    totalPrice,
    userId,
    reservationInfo,
    paymentMethod,
    merchant_uid
  } = data;

  const newBooking = new TourTicketBooking({
    productId,
    startDate,
    endDate,
    adults,
    children,
    totalPrice,
    userId,
    reservationInfo,
    paymentMethod,
    paymentStatus: 'COMPLETED', // ✅ 무조건 COMPLETED
    merchant_uid
  });

  return await newBooking.save();
};

// ✅ 2️⃣ 예약 조회
exports.getTourTicketBookingById = async bookingId => {
  return await TourTicketBooking.findById(bookingId).populate('userId productId');
};

exports.getUserTourTicketBookings = async userId => {
  return await TourTicketBooking.find({userId}).populate('productId');
};

// ✅ 3️⃣ 예약 취소 (상태 변경: "CANCELED")
exports.cancelTourTicketBooking = async bookingId => {
  const booking = await TourTicketBooking.findById(bookingId);
  if (!booking) {
    return {status: 404, message: '예약 정보를 찾을 수 없습니다.'};
  }

  booking.paymentStatus = 'CANCELED'; // ✅ 취소된 예약은 CANCELED 상태
  await booking.save();

  return {status: 200, message: '예약이 취소되었습니다.'};
};

// ✅ 4️⃣ 결제 검증 (merchant_uid로 예약 조회)
exports.verifyTourTicketPayment = async ({imp_uid, merchant_uid}) => {
  try {
    const accessToken = await getPortOneToken();

    // ✅ 포트원 결제 정보 조회
    const {data} = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: {Authorization: accessToken}
    });

    const paymentData = data.response;
    if (!paymentData) {
      return {status: 400, message: '결제 정보를 찾을 수 없습니다.'};
    }

    // ✅ 예약 정보 조회
    const booking = await TourTicketBooking.findOne({merchant_uid});
    if (!booking) {
      return {status: 404, message: '예약 정보를 찾을 수 없습니다.'};
    }

    // ✅ 결제 금액 검증
    if (paymentData.amount !== booking.totalPrice) {
      return {status: 400, message: '결제 금액 불일치'};
    }

    return {status: 200, message: '결제 검증 성공', booking};
  } catch (error) {
    console.error('결제 검증 오류:', error);
    return {status: 500, message: '결제 검증 중 서버 오류 발생'};
  }
};
