const axios = require('axios');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TourTicket = require('../models/TourTicket');
const Room = require('../models/Room');
const TravelItem = require('../models/TravelItem');
const Flight = require('../models/Flight');
const schedule = require('node-schedule');

let cachedToken = null;
let tokenExpiration = null;

const getPortOneToken = async () => {
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) return cachedToken;

  const {data} = await axios.post('https://api.iamport.kr/users/getToken', {
    imp_key: process.env.PORTONE_API_KEY,
    imp_secret: process.env.PORTONE_API_SECRET
  });

  if (data.code !== 0) throw new Error(`포트원 토큰 요청 실패: ${data.message}`);

  cachedToken = data.response.access_token;
  tokenExpiration = data.response.expired_at * 1000;

  return cachedToken;
};

exports.createBooking = async bookingData => {
  try {
    // 단일 상품 배열 변환 유지
    const types = Array.isArray(bookingData.types)
      ? bookingData.types
      : [bookingData.types];

    const productIds = Array.isArray(bookingData.productIds)
      ? bookingData.productIds
      : [bookingData.productIds];

    const counts = Array.isArray(bookingData.counts)
      ? bookingData.counts
      : [bookingData.counts];

    const {roomIds, startDates, endDates, merchant_uid, ...rest} = bookingData;

    // merchant_uid 중복 검사
    const existingBooking = await Booking.findOne({merchant_uid});

    if (existingBooking) {
      return {status: 400, message: '이미 존재하는 예약번호입니다.'};
    }

    // 하나의 예약 데이터로 생성
    const newBooking = new Booking({
      types,
      productIds,
      counts,
      roomIds: roomIds || [],
      startDates: startDates || [],
      endDates: endDates || [],
      merchant_uid,
      ...rest
    });

    await newBooking.save();
    exports.scheduleAutoConfirm(newBooking._id, newBooking.createdAt);

    return {status: 200, booking: newBooking, message: '예약 생성 완료'};
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return {status: 500, message: '예약 생성 중 오류 발생'};
  }
};

exports.verifyPayment = async ({imp_uid, merchant_uid}) => {
  try {
    const accessToken = await getPortOneToken();
    const {data} = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: {Authorization: accessToken}
    });

    const paymentData = data.response;

    const bookings = await Booking.find({merchant_uid});

    if (!bookings.length) throw new Error('예약 데이터를 찾을 수 없습니다.');

    await Promise.all(
      bookings.map(async booking => {
        const {types, productIds, counts} = booking;

        if (
          !Array.isArray(types) ||
          !Array.isArray(productIds) ||
          !Array.isArray(counts)
        ) {
          throw new Error('예약 데이터 배열이 올바르지 않습니다.');
        }

        await Promise.all(
          productIds.map(async (productId, index) => {
            let product;

            switch (types[index]) {
              case 'tourTicket':
                product = await TourTicket.findById(productId);
                product.stock -= counts[index];
                break;

              case 'flight':
                product = await Flight.findById(productId);
                // 필수 필드 기본값 설정
                product.arrival.weekday = product.arrival.weekday || '월요일';
                product.departure.weekday = product.departure.weekday || '월요일';
                product.airlineKorean = product.airlineKorean || '항공사';

                product.availableSeats -= counts[index];
                break;

              case 'accommodation':
                product = await Room.findById(booking.roomId);
                product.reservedDates.push({
                  date: booking.startDate,
                  count: counts[index]
                });
                break;

              case 'travelItem':
                product = await TravelItem.findById(productId);
                product.stock -= counts[index];
                break;
            }

            if (!product) throw new Error(`${types[index]} 상품을 찾을 수 없습니다.`);
            await product.save();
          })
        );

        if (Number(paymentData.amount) !== Number(booking.totalPrice)) {
          throw new Error('결제 금액 불일치');
        }

        const newPayment = new Payment({
          bookingId: booking._id,
          imp_uid,
          merchant_uid,
          userId: booking.userId,
          amount: paymentData.amount,
          status: 'PAID',
          paymentMethod: paymentData.pay_method,
          paidAt: new Date(paymentData.paid_at * 1000)
        });

        await newPayment.save();
        booking.paymentStatus = 'COMPLETED';
        await booking.save();
      })
    );

    return {status: 200, message: '결제 검증 성공'};
  } catch (error) {
    console.error('결제 검증 오류:', error);
    return {status: 500, message: `결제 검증 중 오류: ${error.message}`};
  }
};

exports.cancelBooking = async bookingIds => {
  try {
    const bookings = await Booking.find({_id: {$in: bookingIds}});

    await Promise.all(
      bookings.map(async booking => {
        const {types, productIds, counts} = booking;

        const prodIds = Array.isArray(productIds) ? productIds : [productIds];
        const prodTypes = Array.isArray(types) ? types : [types];
        const prodCounts = Array.isArray(counts) ? counts : [counts];

        await Promise.all(
          prodIds.map(async (productId, index) => {
            let product;

            try {
              switch (prodTypes[index]) {
                case 'tourTicket':
                  product = await TourTicket.findById(productId);
                  product.stock += prodCounts[index];
                  break;

                case 'flight':
                  product = await Flight.findById(productId);
                  product.availableSeats += prodCounts[index];
                  break;

                case 'accommodation':
                  product = await Room.findById(booking.roomIds[index]);
                  product.reservedDates = product.reservedDates.filter(
                    d =>
                      d.date.toISOString().split('T')[0] !==
                      booking.startDates[index].toISOString().split('T')[0]
                  );

                  break;

                case 'travelItem':
                  product = await TravelItem.findById(productId);
                  product.stock += prodCounts[index];
                  break;
              }

              if (product) await product.save();
            } catch (err) {
              console.error('상품 정보 업데이트 중 오류:', err);
            }
          })
        );

        booking.paymentStatus = 'CANCELED';
        booking.updatedAt = Date.now() + 9 * 60 * 60 * 1000;
        await booking.save();
      })
    );

    return {status: 200, message: '모든 예약이 취소되었습니다.'};
  } catch (error) {
    console.error('예약 취소 중 오류:', error);
    return {status: 500, message: '예약 취소 중 오류 발생'};
  }
};

exports.getUserBookings = async userId => {
  try {
    const bookings = await Booking.find({userId}).populate({path: 'productIds'}); // 배열로 된 productIds 전체를 populate

    if (!bookings || bookings.length === 0) {
      return {status: 404, message: '예약 내역 없음'};
    }

    return {status: 200, data: bookings};
  } catch (error) {
    console.error('예약 조회 오류:', error);
    return {status: 500, message: '서버 오류'};
  }
};

exports.confirmBooking = async bookingId => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return {status: 404, message: '예약을 찾을 수 없습니다.'};

    if (booking.paymentStatus === 'COMPLETED') {
      booking.paymentStatus = 'CONFIRMED';
      await booking.save();
      return {status: 200, message: '구매 확정 완료'};
    } else {
      return {status: 400, message: '구매 확정 불가 상태'};
    }
  } catch (error) {
    console.error('구매 확정 오류:', error);
    return {status: 500, message: '구매 확정 중 오류 발생'};
  }
};

exports.scheduleAutoConfirm = (bookingId, createdAt) => {
  const confirmTime = new Date(new Date(createdAt).getTime() + 3 * 60 * 1000);
  schedule.scheduleJob(confirmTime, async () => {
    const booking = await Booking.findById(bookingId);
    if (booking && booking.paymentStatus === 'COMPLETED') {
      booking.paymentStatus = 'CONFIRMED';
      await booking.save();
      console.log(`✅ 3분 경과, 예약 ${bookingId} 구매 확정`);
    }
  });
};
