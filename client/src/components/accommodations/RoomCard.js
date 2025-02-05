// src/components/accommodations/RoomCard.js
import React from 'react';

const RoomCard = ({room}) => {
  const SERVER_URL = 'http://localhost:5000';

  // ✅ 이미지가 없는 경우 기본 이미지 설정
  let imageUrl = room.images?.[0] || '/default-image.jpg';

  // ✅ 이미지가 상대 경로(`/uploads/...`)일 경우, 서버 주소 추가
  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${SERVER_URL}${imageUrl}`;
  }

  console.log('Room Image:', imageUrl); // 디버깅용

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
      </div>
    </div>
  );
};

export default RoomCard;
