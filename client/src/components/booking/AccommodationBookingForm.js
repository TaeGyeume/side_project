import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getRoomById} from '../../api/room/roomService'; // 객실 정보 API
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const BookingForm = () => {
  const {roomId} = useParams(); // URL에서 객실 ID 가져오기
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    count: 1 // ✅ adults → count로 변경 (예약할 객실 개수)
  });

  useEffect(() => {
    // 객실 정보 가져오기
    const fetchRoom = async () => {
      try {
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error('❌ 객실 정보를 불러오는 중 오류 발생:', error);
      }
    };

    // 현재 로그인한 사용자 정보 가져오기
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('❌ 사용자 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchRoom();
    fetchUser();
  }, [roomId]);

  if (!room || !user) {
    return <p>🔄 객실 정보를 불러오는 중...</p>;
  }

  // 입력값 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  /* ✅ 예약 생성 및 결제 요청 */
  const handlePayment = async () => {
    if (!formData.startDate || !formData.endDate) {
      alert('🚨 체크인 날짜와 체크아웃 날짜를 선택하세요.');
      return;
    }

    // ✅ 날짜 유효성 검사 (체크아웃이 체크인 이후인지 확인)
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      alert('🚨 체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
      return;
    }

    // ✅ 총 결제 금액 계산 (숙박일수 * 1박 요금 * 객실 개수)
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights * formData.count;

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국 시간
    const formattedDate = now
      .toISOString()
      .slice(2, 19) // YYMMDDTHHMMSS
      .replace(/[-T:]/g, ''); // YYMMDDHHMMSS

    const merchant_uid = `${user.username}_${formattedDate}`;

    try {
      console.log('📢 예약 요청 데이터:', {
        type: 'accommodation',
        roomId: room._id, // ✅ 객실 ID만 보냄
        merchant_uid,
        startDate: formData.startDate,
        endDate: formData.endDate,
        count: formData.count, // ✅ adults → count로 변경
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      // ✅ 예약 생성 요청 (백엔드에서 숙소 ID 자동 설정)
      const bookingResponse = await createBooking({
        type: 'accommodation',
        roomId: room._id, // ✅ 객실 ID만 보냄
        merchant_uid,
        startDate: formData.startDate,
        endDate: formData.endDate,
        count: formData.count, // ✅ adults 제거 → count 추가
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
        throw new Error('🚨 예약 생성 실패');
      }

      // ✅ 예약이 성공하면 결제 요청 실행
      const {IMP} = window;
      IMP.init('imp22685348'); // 포트원 결제 시스템 초기화

      IMP.request_pay(
        {
          pg: 'html5_inicis.INIpayTest',
          pay_method: 'card',
          merchant_uid, // 예약에서 받은 merchant_uid 사용
          name: room.name, // 객실 이름
          amount: totalPrice, // 최종 결제 금액
          buyer_email: user.email,
          buyer_name: user.username,
          buyer_tel: user.phone
        },
        async rsp => {
          if (rsp.success) {
            // ✅ 결제 성공 → 결제 검증 요청
            try {
              console.log('📢 결제 검증 요청 데이터:', {
                imp_uid: rsp.imp_uid,
                merchant_uid
              });

              const verifyResponse = await verifyPayment({
                imp_uid: rsp.imp_uid,
                merchant_uid
              });

              console.log('✅ 결제 검증 응답:', verifyResponse);

              if (verifyResponse.message === '결제 검증 성공') {
                alert('✅ 예약 및 결제가 완료되었습니다.');
              } else {
                alert(`🚨 결제 검증 실패: ${verifyResponse.message}`);
                console.error('결제 검증 실패 상세 로그:', verifyResponse);
              }
            } catch (error) {
              console.error('❌ 결제 검증 중 오류 발생:', error);
              alert('🚨 결제 검증 중 오류가 발생했습니다.');
            }
          } else {
            alert(`🚨 결제 실패: ${rsp.error_msg}`);
          }
        }
      );
    } catch (error) {
      console.error('❌ 예약 요청 오류:', error);
      alert('🚨 예약 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="booking-form">
      <h3>🏨 객실명: {room.name}</h3>
      <p>💰 1박 가격: {room.pricePerNight.toLocaleString()} 원</p>

      <label>📅 체크인 날짜</label>
      <input
        type="date"
        name="startDate"
        value={formData.startDate}
        onChange={handleChange}
      />

      <label>📅 체크아웃 날짜</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
      />

      <label>🏨 예약할 객실 개수</label>
      <input
        type="number"
        name="count"
        value={formData.count}
        min="1"
        max={room.availableCount} // ✅ 남은 객실 개수 반영
        onChange={handleChange}
      />

      <button onClick={handlePayment} className="payment-btn">
        💳 결제하기
      </button>
    </div>
  );
};

export default BookingForm;
