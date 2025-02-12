// 예약 및 결제 파라미터 입력 폼
// 항공, 숙소 파라미터 아직 미입력

import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getTourTicketById} from '../../api/tourTicket/tourTicketService';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const TourTicketBookingForm = () => {
  const {id} = useParams();
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    count: 1
  });

  useEffect(() => {
    // 투어.티켓 정보 가져오기
    const fetchTicket = async () => {
      try {
        const data = await getTourTicketById(id);
        setTicket(data);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

    // 현재 로그인한 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };

    fetchTicket();
    fetchUser();
  }, [id]);

  if (!ticket || !user) {
    return <p>상품 정보를 불러오는 중...</p>;
  }

  // 입력값 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  /*예약 생성 및 결제 요청 */
  const handlePayment = async () => {
    const totalPrice = ticket.price * formData.count;
    const merchant_uid = `tourTicket_${Date.now() + 9 * 60 * 60 * 1000}`; // 예약 단계에서 미리 생성

    try {
      // 예약 생성 요청 (merchant_uid 포함)
      console.log('예약 요청 데이터:', {
        type: 'tourTicket',
        productId: ticket._id,
        merchant_uid, // 미리 생성한 merchant_uid 사용
        count: formData.count,
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      const bookingResponse = await createBooking({
        type: 'tourTicket',
        productId: ticket._id,
        merchant_uid,
        count: formData.count,
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      console.log('예약 생성 응답:', bookingResponse);

      if (!bookingResponse || !bookingResponse.booking) {
        throw new Error('예약 생성 실패');
      }
    } catch (error) {
      console.error('예약 요청 오류:', error);
      alert('예약 요청 중 오류가 발생했습니다.');
      return;
    }

    // 포트원 결제 요청
    const {IMP} = window;
    IMP.init('imp22685348');

    IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: merchant_uid, // 예약에서 받은 merchant_uid 사용
        name: ticket.title,
        amount: totalPrice,
        buyer_email: user.email,
        buyer_name: user.username,
        buyer_tel: user.phone
      },
      async rsp => {
        if (rsp.success) {
          // 결제 검증 요청
          try {
            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid
            });

            if (verifyResponse.message === '결제 검증 성공') {
              alert('예약이 완료되었습니다.');
            } else {
              alert(`결제 검증 실패: ${verifyResponse.message}`);
              console.error('결제 검증 실패 상세 로그:', verifyResponse);
            }
          } catch (error) {
            console.error('결제 검증 중 오류 발생:', error);
            alert('결제 검증 중 오류가 발생했습니다.');
          }
        } else {
          alert(`결제 실패: ${rsp.error_msg}`);
        }
      }
    );
  };

  return (
    <div className="booking-form">
      <h3>상품명: {ticket.title}</h3>
      <p>가격: {ticket.price.toLocaleString()} 원</p>

      <label>총 개수</label>
      <input
        type="number"
        name="count"
        value={formData.count}
        min="1"
        max="50"
        onChange={handleChange}
      />

      <button onClick={handlePayment} className="payment-btn">
        결제하기
      </button>
    </div>
  );
};

export default TourTicketBookingForm;
