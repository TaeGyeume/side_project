import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import SearchResultsList from '../../components/flights/SearchResultsList';

const RoundTripResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const departureFlights = location.state?.departureFlights || []; // 출발 항공편
  const returnFlights = location.state?.returnFlights || []; // 도착 항공편

  return (
    <div className="container mt-4">
      <h2 className="fw-bold text-center">✈️ 왕복 항공편 검색 결과</h2>

      {/* 🔹 출발 항공편 리스트 */}
      <h3 className="fw-bold mt-4">🛫 출발 항공편</h3>
      {departureFlights.length === 0 ? (
        <p className="text-muted">🚫 출발 항공편이 없습니다.</p>
      ) : (
        <SearchResultsList flights={departureFlights} />
      )}

      {/* 🔹 돌아오는 항공편 리스트 */}
      <h3 className="fw-bold mt-4">🛬 돌아오는 항공편</h3>
      {returnFlights.length === 0 ? (
        <p className="text-muted">🚫 돌아오는 항공편이 없습니다.</p>
      ) : (
        <SearchResultsList flights={returnFlights} />
      )}

      {/* 🔙 뒤로 가기 버튼 */}
      <div className="text-center mt-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700">
          🔙 검색 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default RoundTripResults;
