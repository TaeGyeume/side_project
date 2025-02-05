import React, { useState } from 'react';
import './styles/FlightSearch.css';
import { searchFlights } from '../../api/flight/flights'; // ✅ API import

// ✅ 공항 한글 → 코드 변환
const AIRPORT_CODES = {
  "김포": "GMP",
  "인천": "ICN",
  "김해": "PUS",
  "제주": "CJU",
  "대구": "TAE",
  "광주": "KWJ",
  "청주": "CJJ",
  "여수": "RSU",
  "무안": "MWX",
};

const FlightSearch = ({ onSearch }) => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = async () => {
    console.log("🔍 검색 요청:", { departure, arrival, date });

    // ✅ 한글 입력 시 공항 코드 변환
    const deptCode = AIRPORT_CODES[departure] || departure;
    const arrCode = AIRPORT_CODES[arrival] || arrival;

    try {
      const searchData = await searchFlights(deptCode, arrCode, date);
      console.log("✅ 검색된 데이터:", searchData);
      onSearch(searchData); // ✅ 검색 결과 전달
    } catch (error) {
      console.error("🚨 검색 실패:", error);
      onSearch([]); // 검색 실패 시 빈 배열 전달
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">✈️ 항공편 검색</h2>

      <div className="flex space-x-2 items-center">
        <input
          type="text"
          placeholder="출발 공항 (예: 김포)"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          placeholder="도착 공항 (예: 제주)"
          value={arrival}
          onChange={(e) => setArrival(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-1/4"
        />

        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          검색
        </button>
      </div>
    </div>
  );
};

export default FlightSearch;
