import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

const RoundTripDeparture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {departureFlights, passengers} = location.state || {
    departureFlights: [],
    passengers: 1
  };

  const handleSelectDeparture = flight => {
    console.log('✅ 출발 항공편 선택됨:', flight);

    // 출발 항공편 선택 후 도착 항공편 선택 페이지로 이동
    navigate('/flights/roundtrip-return', {
      state: {selectedDeparture: flight, passengers}
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🛫 출발 항공편 선택</h2>
      {departureFlights.length === 0 ? (
        <p className="text-center">🚫 출발 항공편이 없습니다.</p>
      ) : (
        <div className="list-group">
          {departureFlights.map(flight => (
            <button
              key={flight._id}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelectDeparture(flight)}>
              ✈ {flight.airline} {flight.flightNumber} - {flight.departure.time} →{' '}
              {flight.arrival.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoundTripDeparture;
