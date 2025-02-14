// 예약 및 결제 파라미터 입력 폼

import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getTourTicketById} from '../../api/tourTicket/tourTicketService';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const TourTicketBookingForm = () => {
  const {id} = useParams();
  const [ticket, setTicket] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({count: 1});

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTourTicketById(id);
        setTicket(data);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

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

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handlePayment = async () => {
    const selectedProducts = [
      {
        type: 'tourTicket',
        productId: ticket._id,
        count: formData.count,
        price: ticket.price
      }
    ];

    const totalPrice = selectedProducts.reduce(
      (sum, item) => sum + item.count * item.price,
      0
    );

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국 시간
    const formattedDate = now
      .toISOString()
      .slice(2, 19) // YYMMDDTHHMMSS
      .replace(/[-T:]/g, ''); // YYMMDDHHMMSS

    const merchant_uid = `${user.username}_${formattedDate}`;

    const bookingData = {
      types: selectedProducts.map(item => item.type), // 서버 스키마에 맞게 수정
      productIds: selectedProducts.map(item => item.productId), // 상품 ID 배열
      counts: selectedProducts.map(item => item.count), // 개수 배열
      totalPrice,
      userId: user._id,
      reservationInfo: {name: user.username, email: user.email, phone: user.phone},
      merchant_uid
    };

    // console.log('🔍 예약 요청 데이터:', bookingData);

    try {
      const bookingResponse = await createBooking(bookingData); // 수정된 변수명 기반 데이터 전달
      // console.log('예약 생성 성공:', bookingResponse);

      const {IMP} = window;
      IMP.init('imp22685348');

      IMP.request_pay(
        {
          pg: 'html5_inicis.INIpayTest',
          pay_method: 'card',
          merchant_uid,
          name: '투어.티켓 예약',
          amount: totalPrice,
          buyer_email: user.email,
          buyer_name: user.username,
          buyer_tel: user.phone
        },
        async rsp => {
          if (rsp.success) {
            // console.log('결제 성공:', rsp);
            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid
            });

            // console.log('결제 검증 성공:', verifyResponse);
            if (verifyResponse.message === '결제 검증 성공')
              alert('투어.티켓 예약이 완료되었습니다.');
            else alert(`결제 검증 실패: ${verifyResponse.message}`);
          } else alert(`결제 실패: ${rsp.error_msg}`);
        }
      );
    } catch (error) {
      console.error('예약 및 결제 중 오류 발생:', error);
      alert('예약 및 결제 중 오류 발생');
    }
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
