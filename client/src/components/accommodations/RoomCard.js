// src/components/accommodations/RoomCard.js
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '../../store/authStore';
import axios from '../../api/axios';

const RoomCard = ({room, onRoomDeleted}) => {
  const navigate = useNavigate();
  const {user, isAuthenticated} = useAuthStore();
  const SERVER_URL = 'http://localhost:5000';

  // ✅ 이미지가 없는 경우 기본 이미지 설정
  let imageUrl = room.images?.[0] || '/default-image.jpg';

  // ✅ 이미지가 상대 경로(`/uploads/...`)일 경우, 서버 주소 추가
  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${SERVER_URL}${imageUrl}`;
  }

  // ✅ 객실 삭제 핸들러
  const handleDeleteRoom = async () => {
    const confirmDelete = window.confirm(`"${room.name}" 객실을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/rooms/${room._id}`);

      alert('✅ 객실이 삭제되었습니다.');

      if (onRoomDeleted) {
        onRoomDeleted(room._id); // 부모 컴포넌트에서 목록 업데이트
      } else {
        window.location.reload(); // 현재 페이지 새로고침
      }
    } catch (err) {
      console.error('❌ 객실 삭제 오류:', err);
      alert('❌ 객실 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="card mb-3">
      {room.images?.length > 0 && (
        <img
          src={imageUrl}
          className="card-img-top"
          alt={room.name}
          style={{maxWidth: '300px'}}
        />
      )}
      <div className="card-body">
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
        {/* ✅ 관리자인 경우에만 객실 수정 버튼 표시 */}
        {isAuthenticated && user?.roles.includes('admin') && (
          <>
            <button
              type="button"
              className="btn btn-warning mt-2"
              onClick={() => navigate(`/product/room/modify/${room._id}`)}
            >
              ✏️ 객실 수정
            </button>

            <button
              type="button"
              className="btn btn-danger mt-2"
              onClick={handleDeleteRoom}
            >
              🗑️ 객실 삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
