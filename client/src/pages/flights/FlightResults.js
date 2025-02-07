import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import SearchResultsList from '../../components/flights/SearchResultsList';

const FlightResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flights = location.state?.flights || []; // ✅ 올바르게 전달된 데이터만 가져오기

  console.log('🛫 받은 검색 결과:', flights); // ✅ 디버깅 로그 추가

  return (
    <div className="container mt-4">
      {flights.length === 0 ? (
        <p className="text-danger text-center">🚫 검색된 항공편이 없습니다.</p>
      ) : (
        <SearchResultsList flights={flights} />
      )}

      <div className="text-center mt-3">
        <button onClick={() => navigate('/flights')} className="btn btn-secondary">
          🔙 다시 검색하기
        </button>
      </div>
    </div>
  );
};

export default FlightResults;
