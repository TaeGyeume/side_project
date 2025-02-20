import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import SearchResultsList from '../../components/flights/SearchResultsList';

const RoundTripResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const departureFlights = location.state?.departureFlights || [];
  const returnFlights = location.state?.returnFlights || [];

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold text-center mb-4">✈️ 왕복 항공편 검색 결과</h2>

      <div className="row justify-content-center">
        {/* 출발 항공편 리스트 */}
        <h3 className="fw-bold mt-4 text-center">🛫 출발 항공편</h3>
        {departureFlights.length === 0 ? (
          <p className="text-muted text-center">출발 항공편이 없습니다.</p>
        ) : (
          <SearchResultsList flights={departureFlights} />
        )}

        {/* 돌아오는 항공편 리스트 */}
        <h3 className="fw-bold mt-4 text-center">🛬 돌아오는 항공편</h3>
        {returnFlights.length === 0 ? (
          <p className="text-muted text-center">돌아오는 항공편이 없습니다.</p>
        ) : (
          <SearchResultsList flights={returnFlights} />
        )}
      </div>

      {/* 뒤로 가기 버튼 */}
      <div className="text-center mt-4">
        <button className="btn btn-secondary px-4 py-2" onClick={() => navigate(-1)}>
          🔙 검색 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default RoundTripResults;
