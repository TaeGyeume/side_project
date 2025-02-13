const axios = require('axios');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const TourTicket = require('../models/TourTicket');
const Room = require('../models/Room');
const TravelItem = require('../models/TravelItem');
const Flight = require('../models/Flight');

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

        if (!product) {
          return {status: 404, message: '항공 상품 정보를 찾을 수 없습니다.'};
        }

        // ✅ airlineKorean이 없으면 기본값 추가
        if (!product.airlineKorean) {
          product.airlineKorean = product.airline; // 기본값으로 영어 이름 사용
        }

        // ✅ 운영 요일을 `weekday`가 아니라 `operatingDays`에서 확인
        const flightDate = new Date(product.departure.date);
        const dayOfWeek = flightDate.toLocaleDateString('ko-KR', {weekday: 'long'});

        if (!product.operatingDays.includes(dayOfWeek)) {
          console.error(`🚫 해당 날짜(${dayOfWeek})에 운항하지 않는 항공편입니다.`);
          return {status: 400, message: '해당 날짜에 운항하지 않는 항공편입니다.'};
        }

        // ✅ 좌석 감소 처리
        if (product.seatsAvailable < booking.count) {
          return {status: 400, message: '좌석이 부족합니다.'};
        }

        product.seatsAvailable -= booking.count;
        await product.save();
        console.log(`✅ 항공편 좌석 업데이트 완료! 남은 좌석: ${product.seatsAvailable}`);

        break;
      }

      case 'accommodation': {
        product = await Room.findById(booking.roomId);
        if (!product) return {status: 404, message: '객실 정보를 찾을 수 없습니다.'};

        const {startDate, endDate, count} = booking;
        let currentDate = new Date(startDate);

        while (currentDate < new Date(endDate)) {
          const dateStr = currentDate.toISOString().split('T')[0];

          // ✅ 해당 날짜의 예약 개수 가져오기
          let reservedIndex = product.reservedDates.findIndex(
            d => d.date.toISOString().split('T')[0] === dateStr
          );
          let reservedCountOnDate =
            reservedIndex !== -1 ? product.reservedDates[reservedIndex].count : 0;

          // ✅ 예약 가능 여부 체크
          if (reservedCountOnDate + count > product.availableCount) {
            console.error(`❌ ${dateStr} 날짜에 예약 가능한 객실 부족!`);
            return {
              status: 400,
              message: `${dateStr} 날짜에 예약 가능한 객실이 부족합니다.`
            };
          }

          // ✅ 예약 반영
          if (reservedIndex !== -1) {
            product.reservedDates[reservedIndex].count += count;
          } else {
            product.reservedDates.push({date: new Date(dateStr), count});
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        // ✅ 객실 가용 여부 업데이트 (availableCount 반영)
        const totalReserved = product.reservedDates.reduce((acc, d) => acc + d.count, 0);
        product.available = totalReserved < product.availableCount;

        await product.save();
        break;
      }

      case 'travelItem': {
        product = await TravelItem.findById(booking.productId);

        if (!product) return {status: 404, message: '여행용품 정보를 찾을 수 없습니다.'};
        if (product.stock < booking.count)
          return {status: 400, message: '재고가 부족합니다.'};

        product.stock -= booking.count; // ✅ 재고 감소
        product.soldOut = product.stock === 0; // ✅ 품절 여부 업데이트
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

// 이렇게 하니까 예약 조회됨
// exports.getUserBookings = async userId => {
//   try {
//     console.log('📌 예약 조회 요청: 사용자 ID:', userId);

//     // ✅ 예약 목록 조회
//     const bookings = await Booking.find({userId});

//     console.log('🛠️ 예약 데이터 조회 결과:', bookings);

//     if (!bookings.length) {
//       return {status: 404, message: '예약 내역이 없습니다.'};
//     }

//     // ✅ `type` 값 확인 (정상적인 값인지 로그 출력)
//     bookings.forEach((booking, index) => {
//       console.log(`📌 ${index + 1}번째 예약 type:`, booking.type);
//     });

//     return {status: 200, data: bookings};
//   } catch (error) {
//     console.error('🚨 예약 내역 조회 오류:', error);
//     return {status: 500, message: '서버 오류 발생'};
//   }
// };
exports.getUserBookings = async userId => {
  try {
    console.log('예약 조회 요청: 사용자 ID:', userId);

    // 예약 목록 조회
    const bookings = await Booking.find({userId}).populate({
      path: 'productId',
      select: 'title name' // productId에서 title 필드만 가져오기
    });

    console.log('예약 데이터 조회 결과:', bookings);

    if (!bookings.length) {
      return {status: 404, message: '예약 내역이 없습니다.'};
    }

    bookings.forEach((booking, index) => {
      console.log(`📌 ${index + 1}번째 예약 type:`, booking.type);
    });

    return {status: 200, data: bookings};
  } catch (error) {
    console.error('예약 내역 조회 오류:', error);
    return {status: 500, message: '서버 오류 발생'};
  }
};
