// src/components/accommodations/RoomCard.js
import React from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthStore} from '../../store/authStore';
import {deleteRoom} from '../../api/room/roomService';

const RoomCard = ({room, onRoomDeleted}) => {
  const navigate = useNavigate();
  const {user, isAuthenticated} = useAuthStore();
  const [searchParams] = useSearchParams();
  const SERVER_URL = 'http://localhost:5000';

  // ✅ 이미지가 없는 경우 기본 이미지 설정
  let imageUrl = room.images?.[0] || '/default-image.jpg';

  // ✅ 이미지가 상대 경로(`/uploads/...`)일 경우, 서버 주소 추가
  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${SERVER_URL}${imageUrl}`;
  }

  // ✅ 검색된 날짜와 인원 정보를 가져오기
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const adults = searchParams.get('adults') || 1;

  // ✅ 객실 상세 페이지 이동
  const handleRoomDetail = () => {
    navigate(
      `/accommodation/room/${room._id}?startDate=${startDate}&endDate=${endDate}&adults=${adults}`
    );
  };

  // ✅ 객실 삭제 핸들러
  const handleDeleteRoom = async event => {
    event.stopPropagation(); // 🔹 카드 클릭 방지
    const confirmDelete = window.confirm(`"${room.name}" 객실을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    try {
      await deleteRoom(room._id);
      alert('✅ 객실이 삭제되었습니다.');

      if (onRoomDeleted) {
        onRoomDeleted(room._id); // 부모 컴포넌트에서 목록 업데이트
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('❌ 객실 삭제 오류:', err);
      alert('❌ 객실 삭제에 실패했습니다.');
    }
  };

  // ✅ 예약 버튼 클릭 시 이동
  const handleBooking = event => {
    event.stopPropagation(); // 🔹 카드 클릭 방지
    navigate(
      `/accommodation/booking/${room._id}?startDate=${startDate}&endDate=${endDate}&adults=${adults}`
    );
  };

  // ✅ 수정 버튼 클릭 시 이동
  const handleEditRoom = event => {
    event.stopPropagation(); // 🔹 카드 클릭 방지
    navigate(`/product/room/modify/${room._id}`);
  };

  return (
    <div className="card mb-3" onClick={handleRoomDetail} style={{cursor: 'pointer'}}>
      <div className="d-flex" style={{height: '250px'}}>
        {/* ✅ 왼쪽에 이미지 배치 */}
        <div style={{width: '300px', height: '100%', flexShrink: 0}}>
          <img
            src={imageUrl}
            className="img-fluid h-100"
            alt={room.name}
            style={{
              objectFit: 'cover',
              borderTopLeftRadius: '5px',
              borderBottomLeftRadius: '5px'
            }}
          />
        </div>

        {/* ✅ 오른쪽에 내용 배치 */}
        <div
          className="card-body d-flex flex-column justify-content-between"
          style={{flex: 1, textAlign: 'left'}}>
          <div>
            <h5 className="card-title">{room.name}</h5>
            <p>
              <strong>가격:</strong> {room.pricePerNight.toLocaleString()}원/1박
            </p>
            <p>
              <strong>최대 수용 인원:</strong> {room.maxGuests}명
            </p>
            {room.amenities?.length > 0 && (
              <p>
                <strong>편의시설:</strong> {room.amenities.join(', ')}
              </p>
            )}
          </div>

          {/* ✅ 버튼 배치 (이벤트 버블링 방지) */}
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={handleBooking}>
              🏨 객실 예약하기
            </button>

            {/* ✅ 관리자인 경우에만 객실 수정 및 삭제 버튼 표시 */}
            {isAuthenticated && user?.roles.includes('admin') && (
              <>
                <button
                  type="button"
                  className="btn btn-warning me-2"
                  onClick={handleEditRoom}>
                  ✏️ 객실 수정
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteRoom}>
                  🗑️ 객실 삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
