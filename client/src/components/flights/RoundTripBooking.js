import React from 'react';

// 항공사 로고 매칭
const AIRLINE_LOGOS = {
  대한항공: 'korean.png',
  아시아나항공: 'asiana.png',
  에어서울: 'airseoul.png',
  이스타항공: 'eastar.png',
  진에어: 'jinair.png',
  티웨이항공: 'twayair.png',
  제주항공: 'jejuair.png'
};

// 항공사 로고 경로 함수
const getAirlineLogo = airline =>
  `/images/logos/${AIRLINE_LOGOS[airline] || 'default.png'}`;

const RoundTripBooking = ({selectedDeparture, selectedReturn}) => {
  if (!selectedDeparture || !selectedReturn) return null;

  return (
    <div>
      {/* 출발편 */}
      <div className="card shadow-sm p-3 mb-3" style={{borderRadius: '12px'}}>
        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
          <span className="fw-bold text-primary">🛫 가는편</span>
          <span className="text-muted">
            {new Date(selectedDeparture.departure.date).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
        </div>

        <div className="d-flex align-items-center mt-3">
          <img
            src={getAirlineLogo(selectedDeparture.airline)}
            alt={selectedDeparture.airline}
            className="me-3"
            style={{width: '50px', height: '50px'}}
          />

          <div>
            <h6 className="fw-bold mb-0">{selectedDeparture.airline}</h6>
            <small className="text-muted">{selectedDeparture.flightNumber}</small>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-center">
            <h5 className="fw-bold">{selectedDeparture.departure.time}</h5>
            <small className="text-muted">{selectedDeparture.departure.city}</small>
          </div>

          <div className="fs-4 text-muted">→</div>

          <div className="text-center">
            <h5 className="fw-bold">{selectedDeparture.arrival.time}</h5>
            <small className="text-muted">{selectedDeparture.arrival.city}</small>
          </div>
        </div>
      </div>

      {/* 돌아오는편 */}
      <div className="card shadow-sm p-3" style={{borderRadius: '12px'}}>
        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
          <span className="fw-bold text-success">🛬 오는편</span>
          <span className="text-muted">
            {new Date(selectedReturn.departure.date).toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
        </div>

        <div className="d-flex align-items-center mt-3">
          <img
            src={getAirlineLogo(selectedReturn.airline)}
            alt={selectedReturn.airline}
            className="me-3"
            style={{width: '50px', height: '50px'}}
          />

          <div>
            <h6 className="fw-bold mb-0">{selectedReturn.airline}</h6>
            <small className="text-muted">{selectedReturn.flightNumber}</small>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-center">
            <h5 className="fw-bold">{selectedReturn.departure.time}</h5>
            <small className="text-muted">{selectedReturn.departure.city}</small>
          </div>

          <div className="fs-4 text-muted">→</div>

          <div className="text-center">
            <h5 className="fw-bold">{selectedReturn.arrival.time}</h5>
            <small className="text-muted">{selectedReturn.arrival.city}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundTripBooking;
