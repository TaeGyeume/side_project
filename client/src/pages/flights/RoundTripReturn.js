import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const RoundTripReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedDeparture, returnFlights = [], passengers} = location.state || {};

  const handleSelectReturn = flight => {
    console.log('✅ 도착 항공편 선택됨:', flight);

    // 출발 & 도착 항공편 선택 후 예약 확인 페이지로 이동
    navigate('/flights/roundtrip-confirm', {
      state: {selectedDeparture, selectedReturn: flight, passengers}
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🛬 돌아오는 항공편 선택</h2>

      {/* 🚨 returnFlights가 없는 경우 예외 처리 */}
      {returnFlights.length === 0 ? (
        <p className="text-center text-danger">🚫 돌아오는 항공편이 없습니다.</p>
      ) : (
        <div className="list-group">
          {returnFlights.map(flight => (
            <button
              key={flight._id}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelectReturn(flight)}>
              ✈ {flight.airline} {flight.flightNumber} - {flight.departure.time} →{' '}
              {flight.arrival.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoundTripReturn;
