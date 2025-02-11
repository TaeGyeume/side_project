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

const RoundTripConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {selectedDeparture, selectedReturn, passengers} = location.state || {};

  if (!selectedDeparture || !selectedReturn) {
    return <p className="text-center text-danger">🚫 예약할 항공편이 없습니다.</p>;
  }

  const handleConfirm = () => {
    console.log('✅ 예약 확정:', {selectedDeparture, selectedReturn, passengers});
    alert(
      `🚀 ${passengers}명 예약이 확정되었습니다!\n총 비용: ${totalPrice.toLocaleString()}원`
    );
    navigate('/');
  };

  // ✅ 인원 수를 반영한 총 가격 계산
  const totalPrice = (selectedDeparture.price + selectedReturn.price) * passengers;

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold mb-4 text-center">📋 왕복 항공편 예약 확인</h2>

      {/* 👥 인원수 정보 */}
      <div className="text-center mb-4">
        <h4 className="fw-bold">👥 인원수: {passengers}명</h4>
      </div>

      <div className="row justify-content-center">
        {/* 🛫 출발 항공편 */}
        <div className="col-12 mb-3">
          <div
            className="card p-3 shadow-sm d-flex flex-row align-items-center"
            style={{minHeight: '80px'}}>
            {/* 항공사 로고 및 정보 */}
            <div className="d-flex align-items-center me-3" style={{flexBasis: '200px'}}>
              <img
                src={`/images/logos/${AIRLINE_LOGOS[selectedDeparture.airline] || 'default.png'}`}
                alt={selectedDeparture.airline}
                className="img-fluid"
                style={{width: '40px', height: '40px'}}
              />
              <div className="ms-2">
                <h6 className="mb-1">{selectedDeparture.airline}</h6>
                <small className="text-muted">{selectedDeparture.flightNumber}</small>
              </div>
            </div>

            {/* 출발 시간 */}
            <div className="text-center" style={{flexBasis: '150px'}}>
              <p className="fs-5 fw-bold mb-0">{selectedDeparture.departure.time}</p>
              <small className="text-muted">{selectedDeparture.departure.airport}</small>
            </div>

            {/* 방향 아이콘 */}
            <div className="fs-5 text-muted mx-2">→</div>

            {/* 도착 시간 */}
            <div className="text-center" style={{flexBasis: '150px'}}>
              <p className="fs-5 fw-bold mb-0">{selectedDeparture.arrival.time}</p>
              <small className="text-muted">{selectedDeparture.arrival.airport}</small>
            </div>

            {/* 좌석 등급 */}
            <div className="text-center" style={{flexBasis: '120px'}}>
              <p className="fw-semibold text-success mb-0">
                {selectedDeparture.seatClass || '등급 미정'}
              </p>
              <small className="text-muted">
                {selectedDeparture.seatsAvailable || '정보 없음'}석
              </small>
            </div>

            {/* 가격 (1인 기준) */}
            <div
              className="text-end ms-auto"
              style={{flexBasis: '130px', whiteSpace: 'nowrap'}}>
              <p className="fs-5 fw-bold text-primary mb-0">
                {selectedDeparture.price ? selectedDeparture.price.toLocaleString() : '0'}
                원
              </p>
              <small className="text-muted">(1인 기준)</small>
            </div>
          </div>
        </div>

        {/* 🛬 도착 항공편 */}
        <div className="col-12 mb-3">
          <div
            className="card p-3 shadow-sm d-flex flex-row align-items-center"
            style={{minHeight: '80px'}}>
            {/* 항공사 로고 및 정보 */}
            <div className="d-flex align-items-center me-3" style={{flexBasis: '200px'}}>
              <img
                src={`/images/logos/${AIRLINE_LOGOS[selectedReturn.airline] || 'default.png'}`}
                alt={selectedReturn.airline}
                className="img-fluid"
                style={{width: '40px', height: '40px'}}
              />
              <div className="ms-2">
                <h6 className="mb-1">{selectedReturn.airline}</h6>
                <small className="text-muted">{selectedReturn.flightNumber}</small>
              </div>
            </div>

            {/* 출발 시간 */}
            <div className="text-center" style={{flexBasis: '150px'}}>
              <p className="fs-5 fw-bold mb-0">{selectedReturn.departure.time}</p>
              <small className="text-muted">{selectedReturn.departure.airport}</small>
            </div>

            {/* 방향 아이콘 */}
            <div className="fs-5 text-muted mx-2">→</div>

            {/* 도착 시간 */}
            <div className="text-center" style={{flexBasis: '150px'}}>
              <p className="fs-5 fw-bold mb-0">{selectedReturn.arrival.time}</p>
              <small className="text-muted">{selectedReturn.arrival.airport}</small>
            </div>

            {/* 좌석 등급 */}
            <div className="text-center" style={{flexBasis: '120px'}}>
              <p className="fw-semibold text-success mb-0">
                {selectedReturn.seatClass || '등급 미정'}
              </p>
              <small className="text-muted">
                {selectedReturn.seatsAvailable || '정보 없음'}석
              </small>
            </div>

            {/* 가격 (1인 기준) */}
            <div
              className="text-end ms-auto"
              style={{flexBasis: '130px', whiteSpace: 'nowrap'}}>
              <p className="fs-5 fw-bold text-primary mb-0">
                {selectedReturn.price ? selectedReturn.price.toLocaleString() : '0'}원
              </p>
              <small className="text-muted">(1인 기준)</small>
            </div>
          </div>
        </div>

        {/* 총 가격 */}
        <div className="col-12 text-center mt-3">
          <h4 className="fw-bold">💰 총 예약 비용: {totalPrice.toLocaleString()}원</h4>
          <small className="text-muted">(출발편 + 도착편) × {passengers}명</small>
        </div>

        {/* 예약 확정 버튼 */}
        <div className="col-12 text-center mt-3">
          <button className="btn btn-primary px-4 py-2" onClick={handleConfirm}>
            🚀 예약 확정
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundTripConfirm;
