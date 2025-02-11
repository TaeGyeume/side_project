import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {searchFlights} from '../../api/flight/flights';
import LoadingScreen from '../../components/flights/LoadingScreen';

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

const RoundTripDeparture = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {departureFlights, passengers} = location.state || {
    departureFlights: [],
    passengers: 1
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectDeparture = async flight => {
    console.log('✅ 선택한 출발 항공편:', flight);

    const returnDept = flight?.arrival?.airport;
    const returnArr = flight?.departure?.airport;
    const returnDate = location.state?.returnDate || '';
    const passengers = location.state?.passengers || 1;

    if (!returnDept || !returnArr || !returnDate || passengers < 1) {
      console.error('🚨 잘못된 검색 요청:', {
        returnDept,
        returnArr,
        returnDate,
        passengers
      });
      setErrorMessage('🚨 출발지, 도착지, 날짜, 인원수를 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      console.log(
        `🔍 돌아오는 항공편 검색 요청: ${returnDept} → ${returnArr}, 날짜: ${returnDate}`
      );

      const returnFlights = await searchFlights(
        returnDept,
        returnArr,
        returnDate,
        passengers
      );

      setTimeout(() => {
        setLoading(false);
        navigate('/flights/roundtrip-return', {
          state: {selectedDeparture: flight, returnFlights, passengers}
        });
      }, 500);
    } catch (error) {
      console.error('🚨 돌아오는 항공편 검색 실패:', error);
      setErrorMessage('🚨 도착 항공편 검색 중 오류가 발생했습니다.');
      navigate('/flights/roundtrip-return', {
        state: {selectedDeparture: flight, returnFlights: [], passengers}
      });
    }
  };

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold mb-4 text-center">🛫 출발 항공편 선택</h2>

      {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
      {loading && <LoadingScreen />}

      <div className="row justify-content-center">
        {!loading &&
          (departureFlights.length === 0 ? (
            <p className="text-muted text-center">🚫 출발 항공편이 없습니다.</p>
          ) : (
            departureFlights.map(flight => {
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
                      onClick={() => handleSelectDeparture(flight)}>
                      선택
                    </button>
                  </div>
                </div>
              );
            })
          ))}
      </div>
    </div>
  );
};

export default RoundTripDeparture;
