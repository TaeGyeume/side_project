import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

// ✅ 항공사별 로고 매핑
const AIRLINE_LOGOS = {
  대한항공: 'korean.png',
  아시아나항공: 'asiana.png',
  에어서울: 'airseoul.png',
  이스타항공: 'eastar.png',
  진에어: 'jinair.png',
  티웨이항공: 'twayair.png',
  제주항공: 'jejuair.png'
};

const RoundTripReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedDeparture, returnFlights, passengers} = location.state || {};

  if (!selectedDeparture) {
    return (
      <p className="text-center text-danger">🚫 출발 항공편이 선택되지 않았습니다.</p>
    );
  }

  const handleSelectReturn = flight => {
    console.log('✅ 도착 항공편 선택됨:', flight);

    // ✅ 출발 & 도착 항공편 선택 후 BookingPage로 이동
    navigate('/flights/booking', {
      state: {selectedDeparture, selectedReturn: flight, passengers, isRoundTrip: true}
    });
  };

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold mb-4 text-center">🛬 돌아오는 항공편 선택</h2>

      <div className="row justify-content-center">
        {returnFlights.length === 0 ? (
          <p className="text-muted text-center">🚫 돌아오는 항공편이 없습니다.</p>
        ) : (
          returnFlights.map(flight => {
            const logoFile = AIRLINE_LOGOS[flight.airline] || 'default.png';
            return (
              <div key={flight._id} className="col-12 mb-3">
                <div
                  className="card p-3 shadow-sm d-flex flex-row align-items-center"
                  style={{minHeight: '80px'}}>
                  {/* 항공사 로고 및 정보 */}
                  <div
                    className="d-flex align-items-center me-3"
                    style={{flexBasis: '200px'}}>
                    <img
                      src={`/images/logos/${logoFile}`}
                      alt={flight.airline}
                      className="img-fluid"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div className="ms-2">
                      <h6 className="mb-1">{flight.airline}</h6>
                      <small className="text-muted">{flight.flightNumber}</small>
                    </div>
                  </div>

                  {/* 출발 시간 */}
                  <div className="text-center" style={{flexBasis: '150px'}}>
                    <p className="fs-5 fw-bold mb-0">{flight.departure.time}</p>
                    <small className="text-muted">{flight.departure.airport}</small>
                  </div>

                  {/* 방향 아이콘 */}
                  <div className="fs-5 text-muted mx-2">→</div>

                  {/* 도착 시간 */}
                  <div className="text-center" style={{flexBasis: '150px'}}>
                    <p className="fs-5 fw-bold mb-0">{flight.arrival.time}</p>
                    <small className="text-muted">{flight.arrival.airport}</small>
                  </div>

                  {/* 좌석 등급 */}
                  <div className="text-center" style={{flexBasis: '120px'}}>
                    <p className="fw-semibold text-success mb-0">
                      {flight.seatClass || '등급 미정'}
                    </p>
                    <small className="text-muted">
                      {flight.seatsAvailable || '정보 없음'}석
                    </small>
                  </div>

                  {/* 가격 */}
                  <div
                    className="text-end ms-auto"
                    style={{flexBasis: '130px', whiteSpace: 'nowrap'}}>
                    <p className="fs-5 fw-bold text-primary mb-0">
                      {flight.price ? flight.price.toLocaleString() : '0'}원
                    </p>
                  </div>

                  {/* 선택 버튼 */}
                  <button
                    className="btn btn-primary ms-3"
                    onClick={() => handleSelectReturn(flight)}>
                    선택
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoundTripReturn;
