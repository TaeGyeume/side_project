import axios from '../../axios';

const BASE_URL = 'http://localhost:5000/booking/tourTicket';

export const createBooking = async bookingData => {
  try {
    const response = await axios.post(`${BASE_URL}/create`, bookingData);
    return response.data;
  } catch (error) {
    console.error('예약 생성 실패:', error.response?.data || error);
    throw error;
  }
};

export const cancelBooking = async bookingId => {
  try {
    const response = await axios.post(`${BASE_URL}/cancel/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('예약 취소 실패:', error.response?.data || error);
    throw error;
  }
};

export const verifyPayment = async paymentData => {
  try {
    console.log('👉 결제 검증 요청 데이터:', paymentData);

    const response = await axios.post(
      'http://localhost:5000/booking/tourTicket/verify-payment',
      paymentData
    );

    console.log('✅ 결제 검증 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 결제 검증 오류:', error.response?.data || error.message);
    return {status: 500, message: '결제 검증 중 오류 발생'};
  }
};
