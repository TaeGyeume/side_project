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

const OneWayBooking = ({flight}) => {
  if (!flight || !flight.departure || !flight.arrival) return null;

  return (
    <div className="card shadow-sm p-3 mb-3" style={{borderRadius: '12px'}}>
      {/* 헤더 (가는편) */}
      <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
        <span className="fw-bold text-primary">🛫 가는편</span>
        <span className="text-muted">
          {new Date(flight.departure.date).toLocaleDateString('ko-KR', {
            month: 'long',
            day: 'numeric',
            weekday: 'short'
          })}
        </span>
      </div>

      <div className="d-flex align-items-center mt-3">
        {/* 항공사 로고 */}
        <img
          src={getAirlineLogo(flight.airline)}
          alt={flight.airline}
          className="me-3"
          style={{width: '50px', height: '50px'}}
        />

        <div>
          <h6 className="fw-bold mb-0">{flight.airline}</h6>
          <small className="text-muted">{flight.flightNumber}</small>
        </div>
      </div>

      {/* 출발 및 도착 시간 */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-center">
          <h5 className="fw-bold">{flight.departure.time}</h5>
          <small className="text-muted">{flight.departure.city}</small>
        </div>

        <div className="fs-4 text-muted">→</div>

        <div className="text-center">
          <h5 className="fw-bold">{flight.arrival.time}</h5>
          <small className="text-muted">{flight.arrival.city}</small>
        </div>
      </div>

      {/* 좌석 정보 & 가격 */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="text-muted">성인 {flight.seatClass}</span>
        <span className="text-danger fw-bold">잔여 {flight.seatsAvailable}석</span>
      </div>

      <hr />

      {/* 가격 */}
      <div className="d-flex justify-content-between">
        <span className="fw-bold text-dark">가격</span>
        <span className="fs-5 fw-bold">{flight.price.toLocaleString()}원</span>
      </div>
    </div>
  );
};

export default OneWayBooking;
