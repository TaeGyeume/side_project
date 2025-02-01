// src/components/accommodations/RoomCard.js
import React from 'react';

const RoomCard = ({room}) => {
  return (
    <div className="card mb-3">
      {room.images?.length > 0 && (
        <img
          src={room.images[0]}
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
