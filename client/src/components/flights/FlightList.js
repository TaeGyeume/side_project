import React, {useEffect, useState} from 'react';
import {fetchFlights} from '../../api/flight/flights';

// 항공사별 로고 파일 매핑
const AIRLINE_LOGOS = {
  대한항공: 'korean.png',
  아시아나항공: 'asiana.png',
  에어서울: 'airseoul.png',
  이스타항공: 'eastar.png',
  진에어: 'jinair.png',
  티웨이항공: 'twayair.png',
  제주항공: 'jejuair.png'
};

// 항공사 한글명 매핑
const AIRLINE_NAMES = {
  'KOREAN AIR': '대한항공',
  'ASIANA AIRLINE': '아시아나항공',
  'AIR SEOUL': '에어서울',
  'EASTAR JET': '이스타항공'
};

// 시간 포맷 변환 함수 (0700 → 07:00)
const formatTime = timeString => {
  if (!timeString || typeof timeString !== 'string' || timeString.length !== 4) {
    return '시간 미정';
  }
  return `${timeString.substr(0, 2)}:${timeString.substr(2, 2)}`;
};

const FlightList = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        const data = await fetchFlights();
        setFlights(data || []);
      } catch (error) {
        console.error('항공편 데이터를 불러오는 데 실패했습니다:', error);
      }
    };
    loadFlights();
  }, []);

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold mb-4 text-center">모든 항공편 리스트</h2>
      <div className="row justify-content-center">
        {flights.length === 0 ? (
          <p className="text-muted text-center">검색된 항공편이 없습니다.</p>
        ) : (
          flights.map(flight => {
            const logoFile = AIRLINE_LOGOS[flight?.airline] || 'default.png';
            const airlineKorean = AIRLINE_NAMES[flight?.airline] || flight?.airline;
            return (
              <div key={flight?._id} className="col-12 mb-3">
                <div
                  className="card p-3 shadow-sm d-flex flex-row align-items-center"
                  style={{minHeight: '80px'}}>
                  {/* 항공사 로고 및 정보 */}
                  <div
                    className="d-flex align-items-center me-3"
                    style={{flexBasis: '200px'}}>
                    <img
                      src={`/images/logos/${logoFile}`}
                      alt={airlineKorean}
                      className="img-fluid"
                      style={{width: '40px', height: '40px'}}
                    />
                    <div className="ms-2">
                      <h6 className="mb-1">{airlineKorean}</h6>
                      <small className="text-muted">{flight?.flightNumber}</small>
                    </div>
                  </div>

                  {/* 출발 시간 */}
                  <div className="text-center" style={{flexBasis: '150px'}}>
                    <p className="fs-5 fw-bold mb-0">
                      {formatTime(flight?.departure?.time)}
                    </p>
                    <small className="text-muted">{flight?.departure?.airport}</small>
                  </div>

                  {/* 방향 아이콘 */}
                  <div className="fs-5 text-muted mx-2">→</div>

                  {/* 도착 시간 */}
                  <div className="text-center" style={{flexBasis: '150px'}}>
                    <p className="fs-5 fw-bold mb-0">
                      {formatTime(flight?.arrival?.time)}
                    </p>
                    <small className="text-muted">{flight?.arrival?.airport}</small>
                  </div>

                  {/* 좌석 정보 */}
                  <div className="text-center" style={{flexBasis: '120px'}}>
                    <p className="fw-semibold text-success mb-0">
                      {flight?.seatClass || '등급 미정'}
                    </p>
                    <small className="text-muted">
                      {flight?.seatsAvailable || '정보 없음'}석
                    </small>
                  </div>

                  {/* 가격 */}
                  <div
                    className="text-end ms-auto"
                    style={{flexBasis: '130px', whiteSpace: 'nowrap'}}>
                    <p className="fs-5 fw-bold text-primary mb-0">
                      {flight?.price ? flight.price.toLocaleString() : '0'}원
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FlightList;
