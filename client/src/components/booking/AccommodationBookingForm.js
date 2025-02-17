import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getRoomById} from '../../api/room/roomService';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const BookingForm = () => {
  const {roomId} = useParams();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    rooms: [{startDate: '', endDate: '', count: 1}] // ✅ 여러 객실을 처리할 수 있도록 배열로 변경
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error('❌ 객실 정보를 불러오는 중 오류 발생:', error);
      }
    };

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

  // ✅ 입력값 변경 핸들러 (객실 개별 데이터 변경)
  const handleRoomChange = (index, key, value) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index][key] = value;
    setFormData({...formData, rooms: updatedRooms});
  };

  // ✅ 새로운 객실 추가
  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, {startDate: '', endDate: '', count: 1}]
    });
  };

  // ✅ 특정 객실 삭제
  const removeRoom = index => {
    if (formData.rooms.length === 1) return; // 최소 1개 객실 유지
    const updatedRooms = formData.rooms.filter((_, i) => i !== index);
    setFormData({...formData, rooms: updatedRooms});
  };

  /* ✅ 예약 생성 및 결제 요청 */
  const handlePayment = async () => {
    if (formData.rooms.some(room => !room.startDate || !room.endDate)) {
      alert('🚨 모든 객실의 체크인 및 체크아웃 날짜를 선택하세요.');
      return;
    }

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국 시간
    const formattedDate = now.toISOString().slice(2, 19).replace(/[-T:]/g, ''); // YYMMDDHHMMSS
    const merchant_uid = `${user.username}_${formattedDate}`;

    const startDates = formData.rooms.map(room => room.startDate);
    const endDates = formData.rooms.map(room => room.endDate);
    const counts = formData.rooms.map(room => room.count);

    const nights = formData.rooms.map(room =>
      Math.ceil(
        (new Date(room.endDate) - new Date(room.startDate)) / (1000 * 60 * 60 * 24)
      )
    );

    const totalPrice = nights.reduce(
      (sum, night, i) => sum + night * room.pricePerNight * counts[i],
      0
    );

    try {
      console.log('📢 예약 요청 데이터:', {
        types: Array(formData.rooms.length).fill('accommodation'),
        productIds: Array(formData.rooms.length).fill(room.accommodation),
        roomIds: Array(formData.rooms.length).fill(room._id),
        counts,
        merchant_uid,
        startDates,
        endDates,
        totalPrice,
        userId: user._id,
        reservationInfo: {
          name: user.username,
          email: user.email,
          phone: user.phone
        }
      });

      const bookingResponse = await createBooking({
        types: Array(formData.rooms.length).fill('accommodation'),
        productIds: Array(formData.rooms.length).fill(room.accommodation),
        roomIds: Array(formData.rooms.length).fill(room._id),
        counts,
        merchant_uid,
        startDates,
        endDates,
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

      const {IMP} = window;
      IMP.init('imp22685348');

      IMP.request_pay(
        {
          pg: 'html5_inicis.INIpayTest',
          pay_method: 'card',
          merchant_uid,
          name: room.name,
          amount: totalPrice,
          buyer_email: user.email,
          buyer_name: user.username,
          buyer_tel: user.phone
        },
        async rsp => {
          if (rsp.success) {
            try {
              const verifyResponse = await verifyPayment({
                imp_uid: rsp.imp_uid,
                merchant_uid
              });

              if (verifyResponse.message === '결제 검증 성공') {
                alert('✅ 예약 및 결제가 완료되었습니다.');
              } else {
                alert(`🚨 결제 검증 실패: ${verifyResponse.message}`);
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

      {formData.rooms.map((roomData, index) => (
        <div key={index} className="room-group">
          <h4>🏨 객실 {index + 1}</h4>
          <label>📅 체크인 날짜</label>
          <input
            type="date"
            name="startDate"
            value={roomData.startDate}
            onChange={e => handleRoomChange(index, 'startDate', e.target.value)}
          />

          <label>📅 체크아웃 날짜</label>
          <input
            type="date"
            name="endDate"
            value={roomData.endDate}
            onChange={e => handleRoomChange(index, 'endDate', e.target.value)}
          />

          <label>🏨 예약할 객실 개수</label>
          <input
            type="number"
            name="count"
            value={roomData.count}
            min="1"
            max={room.availableCount}
            onChange={e => handleRoomChange(index, 'count', e.target.value)}
          />

          {formData.rooms.length > 1 && (
            <button onClick={() => removeRoom(index)}>🗑 객실 삭제</button>
          )}
        </div>
      ))}

      <button onClick={addRoom}>➕ 객실 추가</button>

      <button onClick={handlePayment} className="payment-btn">
        💳 결제하기
      </button>
    </div>
  );
};

export default BookingForm;
