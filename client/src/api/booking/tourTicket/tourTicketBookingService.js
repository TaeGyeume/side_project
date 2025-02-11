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

export const verifyPayment = async (paymentData) => {
  try {
    console.log('👉 결제 검증 요청 데이터:', paymentData);

    const response = await axios.post(`${BASE_URL}/verify-payment`, paymentData);

    console.log('✅ 결제 검증 응답:', response.data);

    // ✅ 여기서 status가 500이더라도 message가 "결제 검증 성공"이면 정상 처리
    if (response.data.status === 200 || response.data.message === "결제 검증 성공") {
      return response.data;
    } else {
      return { status: 500, message: response.data.message || "결제 검증 중 오류 발생" };
    }
  } catch (error) {
    console.error('❌ 결제 검증 오류:', error.response?.data || error.message);

    // ✅ 서버에서 500이지만, message가 "결제 검증 성공"이면 오류로 처리하지 않도록 수정
    if (error.response?.data?.message === "결제 검증 성공") {
      return { status: 200, message: "결제 검증 성공", booking: error.response.data.booking };
    }

    return { status: 500, message: "결제 검증 중 오류 발생" };
  }
};
