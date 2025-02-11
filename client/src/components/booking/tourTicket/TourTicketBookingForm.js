import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getTourTicketById} from '../../../api/tourTicket/tourTicketService';
import {
  createTourTicketBooking,
  verifyPayment
} from '../../../api/booking/tourTicket/tourTicketBookingService';
import {authAPI} from '../../../api/auth/index';

const SERVER_URL = 'http://localhost:5000'; // ✅ 서버 URL 고정

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
        console.error('❌ 상품 정보를 가져오는 중 오류 발생:', error);
      }
    };

    // ✅ 현재 로그인한 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('❌ 사용자 정보를 가져오는 중 오류 발생:', error);
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

  /** ✅ 결제 요청 및 예약 생성 */
  const handlePayment = async () => {
    if (!formData.startDate || !formData.endDate) {
      alert('이용 시작일과 종료일을 입력하세요.');
      return;
    }

    const {IMP} = window;
    IMP.init('imp22685348');

    const merchant_uid = `tourTicket_${new Date().getTime()}`;

    IMP.request_pay(
      {
        pg: 'html5_inicis.INIpayTest',
        pay_method: 'card',
        merchant_uid,
        name: ticket.title,
        amount: ticket.price,
        buyer_email: user.email,
        buyer_name: user.username,
        buyer_tel: user.phone
      },
      async rsp => {
        if (rsp.success) {
          alert(`✅ 결제 성공! 결제 번호: ${rsp.imp_uid}`);

          try {
            // ✅ 결제 검증 요청 (백엔드 API 호출)
            const verifyData = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid: rsp.merchant_uid
            });

            console.log('🔹 결제 검증 응답:', verifyData);

            // ✅ 결제 검증이 성공하면 예약 생성
            if (verifyData.status === 200) {
              await createTourTicketBooking({
                type: 'tourTicket',
                productId: ticket._id,
                startDate: formData.startDate,
                endDate: formData.endDate,
                adults: formData.adults,
                children: formData.children,
                totalPrice: ticket.price,
                paymentStatus: 'COMPLETED',
                paymentMethod: 'card',
                userId: user._id,
                reservationInfo: {
                  name: user.username,
                  email: user.email,
                  phone: user.phone
                },
                merchant_uid
              });

              alert('✅ 예약이 완료되었습니다.');
              navigate('/tourTicket/list'); // ✅ 예약 완료 후 이동
            } else {
              alert('❌ 결제 검증 실패: ' + verifyData.message);
              navigate('/tourTicket/list'); // ❗ 검증 실패 시에도 이동
            }
          } catch (error) {
            console.error('❌ 결제 검증 중 오류 발생:', error);
            alert('❌ 결제 검증 중 오류가 발생했습니다.');
            navigate('/tourTicket/list'); // ❗ 결제 검증 오류 시에도 이동
          }
        } else {
          alert(`❌ 결제 실패: ${rsp.error_msg}`);
          navigate('/tourTicket/list'); // ❗ 결제 실패 시에도 이동
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
