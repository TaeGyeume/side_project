import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';
import './styles/FlightSearch.css';
import { searchFlights } from '../../api/flight/flights';

// ✅ 공항 한글 → 코드 변환
const AIRPORT_CODES = {
  김포: 'GMP',
  인천: 'ICN',
  김해: 'PUS',
  제주: 'CJU',
  대구: 'TAE',
  광주: 'KWJ',
  청주: 'CJJ',
  여수: 'RSU',
  무안: 'MWX'
};

const FlightSearch = () => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // ✅ 검색 후 페이지 이동을 위한 useNavigate

  const handleSearch = async () => {
    console.log('🔍 검색 요청:', { departure, arrival, date });

    if (!date) {
      setErrorMessage('📅 날짜를 선택해주세요.');
      return;
    }

    // ✅ 입력된 날짜의 요일 계산
    const selectedWeekday = moment(date).format('dddd');

    // ✅ 한글 입력 시 공항 코드 변환
    const deptCode = AIRPORT_CODES[departure] || departure;
    const arrCode = AIRPORT_CODES[arrival] || arrival;

    try {
      const searchData = await searchFlights(deptCode, arrCode, date);

      if (searchData.length === 0) {
        setErrorMessage(`🚫 선택한 날짜 (${date})에 운항하는 항공편이 없습니다.`);
      } else {
        setErrorMessage('');
        console.log('✅ 검색된 데이터:', searchData);
        
        // ✅ 검색된 데이터를 가지고 결과 페이지로 이동
        navigate('/flights/results', { state: { flights: searchData } });
      }
    } catch (error) {
      console.error('🚨 검색 실패:', error);
      setErrorMessage('🚨 검색 중 오류가 발생했습니다.');
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

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          검색
        </button>
      </div>

      {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
    </div>
  );
};

export default FlightSearch;
