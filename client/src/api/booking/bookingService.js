// import axios from '../axios';

// const BASE_URL = 'http://localhost:5000/booking';

// export const createBooking = async bookingData => {
//   try {
//     const response = await axios.post(`${BASE_URL}/create`, bookingData);
//     return response.data;
//   } catch (error) {
//     console.error('예약 생성 실패:', error.response?.data || error);
//     throw error;
//   }
// };

// export const cancelBooking = async bookingId => {
//   try {
//     const response = await axios.post(`${BASE_URL}/cancel/${bookingId}`);

//     if (response.status === 200 || response.message.includes('결제가 취소되었습니다.')) {
//       return response.data;
//     } else {
//       console.error('예약 취소 실패:', response.data.message);
//       return {status: response.data.status, message: response.data.message};
//     }
//   } catch (error) {
//     console.error('예약 취소 중 오류 발생:', error.response?.data || error.message);
//     return {status: 500, message: '예약 취소 중 오류 발생'};
//   }
// };

// export const verifyPayment = async paymentData => {
//   try {
//     const response = await axios.post(`${BASE_URL}/verify-payment`, paymentData);

//     if (response.data.status === 200 || response.data.message === '결제 검증 성공') {
//       return response.data;
//     } else {
//       return {status: 500, message: response.data.message || '결제 검증 중 오류 발생'};
//     }
//   } catch (error) {
//     console.error('결제 검증 오류:', error.response?.data || error.message);

//     if (error.response?.data?.message === '결제 검증 성공') {
//       return {
//         status: 200,
//         message: '결제 검증 성공',
//         booking: error.response.data.booking
//       };
//     }

//     return {status: 500, message: '결제 검증 중 오류 발생'};
//   }
// };

// export const getMyBookings = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/my`);
//     return response.data;
//   } catch (error) {
//     console.error('예약 내역 불러오기 실패:', error);
//     throw error;
//   }
// };

import axios from '../axios';

const BASE_URL = 'http://localhost:5000/booking';

export const createBooking = async bookingData => {
  try {
    console.log('📤 서버로 전송된 예약 데이터:', JSON.stringify(bookingData, null, 2));
    const response = await axios.post(`${BASE_URL}/create`, {
      types: bookingData.types,
      productIds: bookingData.productIds,
      counts: bookingData.counts,
      totalPrice: bookingData.totalPrice,
      userId: bookingData.userId,
      reservationInfo: bookingData.reservationInfo,
      merchant_uid: bookingData.merchant_uid
    });
    return response.data;
  } catch (error) {
    console.error('❌ 예약 생성 실패:', error.response?.data || error);
    throw error;
  }
};

export const cancelBooking = async bookingIds => {
  try {
    const response = await axios.post(`${BASE_URL}/cancel`, {bookingIds}); // 배열 기반 취소
    return response.data;
  } catch (error) {
    console.error('❌ 예약 취소 중 오류:', error.response?.data || error);
    return {status: 500, message: '예약 취소 중 오류 발생'};
  }
};

export const verifyPayment = async paymentData => {
  try {
    const response = await axios.post(`${BASE_URL}/verify-payment`, {
      imp_uid: paymentData.imp_uid,
      merchant_uid: paymentData.merchant_uid
    });
    console.log('✅ 결제 검증 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 결제 검증 오류:', error.response?.data || error);
    return {status: 500, message: '결제 검증 중 오류 발생'};
  }
};

export const getMyBookings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/my`);
    console.log('✅ 내 예약 내역:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 예약 내역 불러오기 실패:', error);
    throw error;
  }
};
