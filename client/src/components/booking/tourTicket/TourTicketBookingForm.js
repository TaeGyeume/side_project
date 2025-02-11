import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getTourTicketById} from '../../../api/tourTicket/tourTicketService';
import {
  createBooking,
  verifyPayment
} from '../../../api/booking/tourTicket/tourTicketBookingService';
import {authAPI} from '../../../api/auth/index';

const TourTicketBookingForm = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0
  });

  useEffect(() => {
    // ✅ 상품 정보 가져오기
    const fetchTicket = async () => {
      try {
        const data = await getTourTicketById(id);
        setTicket(data);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

    // ✅ 현재 로그인한 사용자 정보 가져오기
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

  // ✅ 입력값 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  /** ✅ 예약 생성 및 결제 요청 */
  const handlePayment = async () => {
    if (!formData.startDate || !formData.endDate) {
      alert('이용 시작일과 종료일을 입력하세요.');
      return;
    }

    const totalPrice = ticket.price * (formData.adults + formData.children);
    const merchant_uid = `tourTicket_${Date.now()}`; // ✅ 예약 단계에서 미리 생성

    try {
      // ✅ 1. 예약 생성 요청 (merchant_uid 포함)
      console.log('📌 예약 요청 데이터:', {
        type: 'tourTicket',
        productId: ticket._id,
        merchant_uid, // ✅ 미리 생성한 merchant_uid 사용
        startDate: formData.startDate,
        endDate: formData.endDate,
        adults: formData.adults,
        children: formData.children,
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
        merchant_uid, // ✅ merchant_uid 추가
        startDate: formData.startDate,
        endDate: formData.endDate,
        adults: formData.adults,
        children: formData.children,
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      console.log('✅ 예약 생성 응답:', bookingResponse);

      if (!bookingResponse || !bookingResponse.booking) {
        throw new Error('예약 생성 실패');
      }
    } catch (error) {
      console.error('🚨 예약 요청 오류:', error);
      alert('예약 요청 중 오류가 발생했습니다.');
      return;
    }

    // ✅ 2. 포트원 결제 요청
    const {IMP} = window;
    IMP.init('imp22685348');

    IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid: merchant_uid, // ✅ 예약에서 받은 merchant_uid 사용
        name: ticket.title,
        amount: totalPrice,
        buyer_email: user.email,
        buyer_name: user.username,
        buyer_tel: user.phone
      },
      async rsp => {
        if (rsp.success) {
          alert(`✅ 결제 성공! 결제 번호: ${rsp.imp_uid}`);

          // ✅ 3. 결제 검증 요청
          try {
            console.log('👉 결제 검증 요청 데이터:', {
              imp_uid: rsp.imp_uid,
              merchant_uid
            });

            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid
            });

            console.log('✅ 결제 검증 응답:', verifyResponse);

            if (verifyResponse.status === 200) {
              alert('✅ 결제 검증 성공! 예약이 완료되었습니다.');
              navigate('/tourTicket/booking/success');
            } else {
              alert(`🚨 결제 검증 실패: ${verifyResponse.message}`);
              console.error('🚨 결제 검증 실패 상세 로그:', verifyResponse);
            }
          } catch (error) {
            console.error('🚨 결제 검증 중 오류 발생:', error);
            alert('🚨 결제 검증 중 오류가 발생했습니다.');
          }
        } else {
          alert(`🚨 결제 실패: ${rsp.error_msg}`);
        }
      }
    );
  };

  return (
    <div className="booking-form">
      <h1>📌 {ticket.title} 예약</h1>
      <p>가격: {ticket.price.toLocaleString()} 원</p>

      <label>이용 시작일</label>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
      />

      <label>이용 종료일</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
      />

      <label>성인 인원</label>
      <input
        type="number"
        name="adults"
        value={formData.adults}
        min="1"
        onChange={handleChange}
      />

      <label>소아 인원</label>
      <input
        type="number"
        name="children"
        value={formData.children}
        min="0"
        onChange={handleChange}
      />

      <button onClick={handlePayment} className="payment-btn">
        결제하기
      </button>
    </div>
  );
};

export default TourTicketBookingForm;
