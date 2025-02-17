const axios = require('axios');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TourTicket = require('../models/TourTicket');
const Room = require('../models/Room');
const TravelItem = require('../models/TravelItem');
const Flight = require('../models/Flight');
const UserCoupon = require('../models/UserCoupon');
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

    const roomIds = Array.isArray(bookingData.roomIds)
      ? bookingData.roomIds
      : [bookingData.roomIds];

    const startDates = Array.isArray(bookingData.startDates)
      ? bookingData.startDates
      : [bookingData.startDates];

    const endDates = Array.isArray(bookingData.endDates)
      ? bookingData.endDates
      : [bookingData.endDates];

    console.log('📌 [서버] 변환된 데이터:', {roomIds, startDates, endDates});

    const {merchant_uid, ...rest} = bookingData;

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
      roomIds,
      startDates,
      endDates,
      merchant_uid,
      ...rest
    });

    await newBooking.save();

    return {status: 200, booking: newBooking, message: '예약 생성 완료'};
  } catch (error) {
    console.error('예약 생성 오류:', error);
    return {status: 500, message: '예약 생성 중 오류 발생'};
  }
};

exports.verifyPayment = async ({imp_uid, merchant_uid, couponId = null, userId}) => {
  try {
    const accessToken = await getPortOneToken();
    const {data} = await axios.get(`https://api.iamport.kr/payments/${imp_uid}`, {
      headers: {Authorization: accessToken}
    });

    console.log('📌 [서버] PortOne 결제 정보:', data.response); // ✅ 결제 정보 로그 추가
    const paymentData = data.response;

    // ✅ 해당 merchant_uid에 대한 모든 예약 찾기
    const bookings = await Booking.find({merchant_uid});
    console.log('📌 [서버] 조회된 예약 정보:', bookings); // ✅ 예약 데이터 확인

    if (!bookings.length) throw new Error('예약 데이터를 찾을 수 없습니다.');

    // ✅ 전체 예약 가격 합산
    let totalOriginalPrice = bookings.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0),
      0
    );
    console.log('📌 [서버] 예약 총 가격:', totalOriginalPrice);

    let discountAmount = 0;
    let expectedFinalAmount = totalOriginalPrice;
    const mongoose = require('mongoose');
    // ObjectId 변환 함수
    const toObjectId = id => {
      return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    };

    // ✅ 쿠폰 검증
    if (couponId) {
      console.log('📌 [서버] 쿠폰 검증 시작 - couponId:', couponId, 'userId:', userId);

      const userCoupon = await UserCoupon.findOne({
        _id: toObjectId(couponId), // 쿠폰 ID 변환
        user: toObjectId(userId), // 사용자 ID 변환
        isUsed: false,
        expiresAt: {$gte: new Date()}
      }).populate('coupon'); // ✅ 실제 쿠폰 데이터 가져오기

      console.log('📌 [서버] 조회된 UserCoupon:', userCoupon);

      if (!userCoupon || !userCoupon.coupon) {
        console.error('❌ [서버] 쿠폰을 찾을 수 없음 또는 만료됨!');
        return {status: 400, message: '사용 가능한 쿠폰을 찾을 수 없습니다.'};
      }

      const actualCouponId = userCoupon.coupon._id; // ✅ `UserCoupon`에서 `coupon._id`를 가져옴
      console.log('📌 [서버] 변환된 실제 쿠폰 ID:', actualCouponId);

      const coupon = userCoupon.coupon;

      // ✅ 최소 구매 금액 체크
      if (totalOriginalPrice < coupon.minPurchaseAmount) {
        return {
          status: 400,
          message: `이 쿠폰은 ${coupon.minPurchaseAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다.`
        };
      }

      // ✅ 할인 금액 계산
      if (coupon.discountType === 'percentage') {
        discountAmount = (totalOriginalPrice * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
      }

      // ✅ 최종 결제 금액 업데이트
      expectedFinalAmount = totalOriginalPrice - discountAmount;

      // ✅ 쿠폰을 사용 처리
      userCoupon.isUsed = true;
      await userCoupon.save();
    }

    // ✅ 결제 금액 검증 (expectedFinalAmount가 항상 올바르게 업데이트됨)
    console.log('📌 [서버] 결제 금액 검증:', {
      totalOriginalPrice,
      discountAmount,
      expectedFinalAmount,
      portOneAmount: paymentData.amount
    });

    if (Math.abs(paymentData.amount - expectedFinalAmount) >= 0.01) {
      console.error(
        `❌ 결제 금액 불일치! 포트원: ${paymentData.amount}, 예상 결제 금액: ${expectedFinalAmount}`
      );

      return {status: 400, message: '결제 금액 불일치'};
    }

    await Promise.all(
      bookings.map(async booking => {
        const {types, productIds, counts, roomIds, startDates, endDates} = booking;

        if (
          !Array.isArray(types) ||
          !Array.isArray(productIds) ||
          !Array.isArray(counts) ||
          !Array.isArray(roomIds) ||
          !Array.isArray(startDates) ||
          !Array.isArray(endDates)
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

              case 'accommodation': {
                if (!roomIds[index])
                  return {status: 400, message: '객실 정보가 누락되었습니다.'};

                product = await Room.findById(roomIds[index]);
                if (!product)
                  return {status: 404, message: '객실 정보를 찾을 수 없습니다.'};

                const startDate = new Date(startDates[index]);
                const endDate = new Date(endDates[index]);
                let currentDate = new Date(startDate);

                while (currentDate < endDate) {
                  const dateStr = currentDate.toISOString().split('T')[0];

                  // ✅ 해당 날짜의 예약 개수 가져오기
                  let reservedIndex = product.reservedDates.findIndex(
                    d => d.date.toISOString().split('T')[0] === dateStr
                  );
                  let reservedCountOnDate =
                    reservedIndex !== -1 ? product.reservedDates[reservedIndex].count : 0;

                  // ✅ 예약 가능 여부 체크
                  if (reservedCountOnDate + counts[index] > product.availableCount) {
                    console.error(`❌ ${dateStr} 날짜에 예약 가능한 객실 부족!`);
                    return {
                      status: 400,
                      message: `${dateStr} 날짜에 예약 가능한 객실이 부족합니다.`
                    };
                  }

                  // ✅ 예약 반영
                  if (reservedIndex !== -1) {
                    product.reservedDates[reservedIndex].count += counts[index];
                  } else {
                    product.reservedDates.push({
                      date: new Date(dateStr),
                      count: counts[index]
                    });
                  }

                  currentDate.setDate(currentDate.getDate() + 1);
                }

                // ✅ 객실 가용 여부 업데이트 (availableCount 반영)
                const totalReserved = product.reservedDates.reduce(
                  (acc, d) => acc + d.count,
                  0
                );
                product.available = totalReserved < product.availableCount;

                await product.save();
                break;
              }

              case 'travelItem':
                product = await TravelItem.findById(productId);
                product.stock -= counts[index];
                break;
            }

            if (!product) throw new Error(`${types[index]} 상품을 찾을 수 없습니다.`);
            await product.save();
          })
        );

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

    console.log('✅ [서버] 결제 검증 성공');
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
    if (booking.paymentStatus === 'COMPLETED') {
      booking.paymentStatus = 'CONFIRMED';
      await booking.save();
      return {status: 200, message: '구매 확정 완료'};
    }
    return {status: 400, message: '구매 확정 불가 상태'};
  } catch (error) {
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
