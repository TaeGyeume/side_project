import axios from '../../axios';

// ✅ 예약 생성 (결제 성공 후 호출)
export const createTourTicketBooking = async bookingData => {
  try {
    const response = await axios.post('/booking/tourTicket/create', bookingData);
    return response.data;
  } catch (error) {
    console.error('예약 생성 실패:', error);
    throw error;
  }
};

// ✅ 특정 예약 조회
export const getBookingById = async bookingId => {
  try {
    const response = await axios.get(`/booking/tourTicket/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('예약 조회 실패:', error);
    throw error;
  }
};

// ✅ 특정 유저의 예약 목록 조회
export const getUserBookings = async userId => {
  try {
    const response = await axios.get(`/booking/tourTicket/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('유저 예약 목록 조회 실패:', error);
    throw error;
  }
};

// ✅ 예약 취소
export const cancelBooking = async bookingId => {
  try {
    const response = await axios.delete(`/booking/tourTicket/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('예약 취소 실패:', error);
    throw error;
  }
};

// ✅ 결제 검증
export const verifyPayment = async paymentData => {
  try {
    const response = await axios.post(
      'http://localhost:5000/booking/tourTicket/verify-payment',
      paymentData
    );
    return response.data;
  } catch (error) {
    console.error('❌ 결제 검증 실패:', error);
    throw error;
  }
};
