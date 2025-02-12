import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const FlightBookingForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedDeparture, selectedReturn, passengers, isRoundTrip, selectedFlight} =
    location.state || {};

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ 현재 로그인한 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchUser();
  }, []);

  // ✅ 항공편 정보가 없을 경우
  if ((!selectedDeparture && !selectedFlight) || !user) {
    return <p>🚫 항공편 정보를 불러올 수 없습니다.</p>;
  }

  // ✅ 왕복/편도에 따른 가격 계산
  const totalPrice =
    isRoundTrip && selectedReturn
      ? (selectedDeparture?.price + selectedReturn?.price) * passengers
      : (selectedDeparture?.price || selectedFlight?.price) * passengers;

  // ✅ 결제 요청 핸들러
  const handlePayment = async () => {
    const merchant_uid = `flight_${Date.now()}`; // 예약 고유번호 생성

    try {
      setLoading(true);

      // ✅ 예약 데이터 생성 (기존 Booking API 사용)
      const bookingResponse = await createBooking({
        type: 'flight',
        productId: selectedFlight?._id || selectedDeparture?._id,
        merchant_uid,
        count: passengers,
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      if (!bookingResponse || !bookingResponse.booking) {
        throw new Error('예약 생성 실패');
      }

      // ✅ 포트원 결제 요청
      const {IMP} = window;
      IMP.init('imp22685348'); // 포트원 가맹점 식별코드

      IMP.request_pay(
        {
          pg: 'html5_inicis.INIpayTest',
          pay_method: 'card',
          merchant_uid,
          name: `${selectedDeparture?.flightNumber || selectedFlight?.flightNumber} ${
            isRoundTrip ? '+ 왕복' : ''
          }`,
          amount: totalPrice,
          buyer_email: user.email,
          buyer_name: user.username,
          buyer_tel: user.phone
        },
        async rsp => {
          if (rsp.success) {
            // ✅ 결제 검증 요청
            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid
            });

            if (verifyResponse.message === '결제 검증 성공') {
              alert('🚀 항공편 예약이 완료되었습니다.');
              navigate('/flights/confirmation', {
                state: {
                  selectedDeparture,
                  selectedReturn,
                  passengers,
                  totalPrice
                }
              }); // 예약 완료 페이지로 이동
            } else {
              alert(`❌ 결제 검증 실패: ${verifyResponse.message}`);
            }
          } else {
            alert(`❌ 결제 실패: ${rsp.error_msg}`);
          }
        }
      );
    } catch (error) {
      console.error('🚨 예약 요청 오류:', error);
      alert('🚨 예약 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form">
      <h3>🛫 항공편 예약</h3>
      <p>📌 항공사: {selectedDeparture?.airline || selectedFlight?.airline}</p>
      <p>📌 항공편: {selectedDeparture?.flightNumber || selectedFlight?.flightNumber}</p>
      <p>
        📅 날짜: {selectedDeparture?.departure.date || selectedFlight?.departure.date}
      </p>
      <p>👥 인원수: {passengers}명</p>
      <p>💰 총 가격: {totalPrice.toLocaleString()} 원</p>

      <button onClick={handlePayment} className="payment-btn" disabled={loading}>
        {loading ? '결제 진행 중...' : '결제하기'}
      </button>
    </div>
  );
};

export default FlightBookingForm;
