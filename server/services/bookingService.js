const axios = require('axios');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TourTicket = require('../models/TourTicket');
const Room = require('../models/Room');

const getPortOneToken = async () => {
  try {
    const {data} = await axios({
      url: 'https://api.iamport.kr/users/getToken',
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      data: {
        imp_key: process.env.PORTONE_API_KEY,
        imp_secret: process.env.PORTONE_API_SECRET
      }
    });

    return data.response.access_token;
  } catch (error) {
    console.error('포트원 토큰 요청 실패:', error);
    throw new Error('포트원 토큰 요청 실패');
  }
};

exports.createBooking = async bookingData => {
  try {
    console.log('예약 데이터 저장 요청:', bookingData);

    if (
      bookingData.type === 'accommodation' &&
      bookingData.roomId &&
      !bookingData.productId
    ) {
      const room = await Room.findById(bookingData.roomId);
      if (room) {
        bookingData.productId = room.accommodation; // 숙소 ID 자동 설정
        console.log('✅ 수동 설정된 숙소 ID (productId):', bookingData.productId);
      } else {
        throw new Error('해당 roomId에 해당하는 숙소가 존재하지 않습니다.');
      }
    }

    const newBooking = new Booking({
      ...bookingData,
      paymentStatus: 'PENDING' // 결제 대기 상태로 예약 생성
    });

    const savedBooking = await newBooking.save();

    console.log('예약이 정상적으로 저장됨:', savedBooking);

    return savedBooking;
  } catch (error) {
    console.error('예약 생성 오류:', error);
    throw new Error('예약 생성 실패');
  }
};

exports.verifyPayment = async ({imp_uid, merchant_uid}) => {
  try {
    const accessToken = await getPortOneToken();

    // 포트원에서 결제 정보 조회
    const {data} = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: {Authorization: accessToken}
    });

    const paymentData = data.response;
    if (!paymentData) {
      console.error('결제 정보 조회 실패');
      return {status: 400, message: '결제 정보를 찾을 수 없습니다.'};
    }

    // 예약 정보 조회
    const booking = await Booking.findOne({merchant_uid});
    if (!booking) {
      console.error(`예약 정보를 찾을 수 없음 (merchant_uid: ${merchant_uid})`);
      return {status: 404, message: '예약 정보를 찾을 수 없습니다.'};
    }

    // 결제 금액 일치 여부 확인
    if (paymentData.amount !== booking.totalPrice) {
      console.error(
        `결제 금액 불일치! 포트원: ${paymentData.amount}, 예약 금액: ${booking.totalPrice}`
      );
      return {status: 400, message: '결제 금액 불일치'};
    }

    // 상품별 재고 감소 처리
    let product;

    switch (booking.type) {
      case 'tourTicket': {
        product = await TourTicket.findById(booking.productId);

        if (!product)
          return {status: 404, message: '투어.티켓 상품 정보를 찾을 수 없습니다.'};

        if (product.stock < booking.count)
          return {status: 400, message: '재고가 부족합니다.'};

        product.stock -= booking.count;
        break;
      }

      case 'flight': {
        product = await Flight.findById(booking.productId);

        if (!product) return {status: 404, message: '항공 상품 정보를 찾을 수 없습니다.'};

        if (product.availableSeats < booking.count)
          return {status: 400, message: '좌석이 부족합니다.'};

        product.availableSeats -= booking.count;
        break;
      }

      case 'accommodation': {
        product = await Accommodation.findById(booking.productId);

        if (!product) return {status: 404, message: '숙박 상품 정보를 찾을 수 없습니다.'};

        if (product.availableCount < booking.count)
          return {status: 400, message: '객실이 부족합니다.'};

        product.availableRooms -= booking.count;
        break;
      }

      default:
        return {status: 400, message: '유효하지 않은 상품 유형입니다.'};
    }

    await product.save(); // 재고 저장

    // 결제 정보 저장
    try {
      const newPayment = new Payment({
        bookingId: booking._id,
        imp_uid,
        merchant_uid,
        userId: booking.userId,
        amount: paymentData.amount,
        status: 'PAID',
        paymentMethod: paymentData.pay_method || 'unknown',
        paidAt: paymentData.paid_at ? new Date(paymentData.paid_at * 1000) : new Date(),
        receiptUrl: paymentData.receipt_url || ''
      });

      await newPayment.save();
      console.log(`결제 정보 저장 완료: Payment ID: ${newPayment._id}`);
    } catch (error) {
      console.error('Payment 컬렉션 저장 오류:', error);
      return {status: 500, message: '결제 정보 저장 중 오류 발생'};
    }

    // 예약 상태 업데이트 (결제 완료)
    booking.paymentStatus = 'COMPLETED';
    await booking.save();

    console.log(`결제 검증 성공! 예약 ID: ${booking._id}`);
    return {status: 200, message: '결제 검증 성공', booking};
  } catch (error) {
    console.error('결제 검증 오류:', error);
    return {status: 500, message: '결제 검증 중 서버 오류 발생'};
  }
};

exports.cancelBooking = async bookingId => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return {status: 404, message: '예약 정보를 찾을 수 없습니다.'};
    }

    // 예약 취소 상태로 변경
    booking.paymentStatus = 'CANCELED';
    await booking.save();

    return {status: 200, message: '예약이 성공적으로 취소되었습니다.'};
  } catch (error) {
    console.error('예약 취소 오류:', error);
    return {status: 500, message: '예약 취소 중 서버 오류 발생'};
  }
};
