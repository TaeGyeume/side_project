import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const RoundTripConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedDeparture, selectedReturn, passengers} = location.state || {};

  const handleConfirm = () => {
    console.log('✅ 예약 확정:', {selectedDeparture, selectedReturn, passengers});
    alert('🚀 예약이 확정되었습니다!');
    navigate('/');
  };

  if (!selectedDeparture || !selectedReturn) {
    return <p className="text-center">🚫 예약할 항공편이 없습니다.</p>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📋 왕복 항공편 예약 확인</h2>

      <div className="card p-3 shadow-sm">
        <h5 className="fw-bold">🛫 출발 항공편</h5>
        <p>
          {selectedDeparture.airline} {selectedDeparture.flightNumber}
        </p>
        <p>
          {selectedDeparture.departure.time} → {selectedDeparture.arrival.time}
        </p>

        <h5 className="fw-bold mt-3">🛬 도착 항공편</h5>
        <p>
          {selectedReturn.airline} {selectedReturn.flightNumber}
        </p>
        <p>
          {selectedReturn.departure.time} → {selectedReturn.arrival.time}
        </p>

        <h5 className="fw-bold mt-3">👥 인원수: {passengers}명</h5>

        <button className="btn btn-primary mt-3" onClick={handleConfirm}>
          🚀 예약 확정
        </button>
      </div>
    </div>
  );
};

export default RoundTripConfirm;
