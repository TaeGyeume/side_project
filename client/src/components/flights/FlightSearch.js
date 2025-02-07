import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './styles/FlightSearch.css';
import {searchFlights} from '../../api/flight/flights';
import LoadingScreen from './LoadingScreen';

// ✅ 공항 한글 → 코드 변환
const AIRPORT_CODES = {
  // 김포
  서울: 'GMP',
  인천: 'ICN',
  부산: 'PUS',
  제주: 'CJU',
  대구: 'TAE',
  광주: 'KWJ',
  청주: 'CJJ',
  여수: 'RSU',
  무안: 'MWX'
};

// ✅ 공항 목록
const AIRPORT_LIST = ['서울', '부산', '제주', '대구', '광주', '청주', '여수', '무안'];

const FlightSearch = () => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ 검색 후 페이지 이동을 위한 useNavigate

  const handleSearch = async () => {
    console.log('🔍 검색 요청:', {departure, arrival, date});

    if (!date) {
      setErrorMessage('📅 날짜를 선택해주세요.');
      return;
    }

    // ✅ 한글 입력 시 공항 코드 변환
    const deptCode = AIRPORT_CODES[departure] || departure;
    const arrCode = AIRPORT_CODES[arrival] || arrival;

    setLoading(true);

    try {
      const searchData = await searchFlights(deptCode, arrCode, date);

      if (searchData.length === 0) {
        setErrorMessage(`🚫 선택한 날짜 (${date})에 운항하는 항공편이 없습니다.`);
        setLoading(false);
      } else {
        setErrorMessage('');
        console.log('✅ 검색된 데이터:', searchData);

        setTimeout(() => {
          navigate('/flights/results', {state: {flights: searchData}});
        }, 500);
      }
    } catch (error) {
      console.error('🚨 검색 실패:', error);
      setErrorMessage('🚨 검색 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">✈️ 항공편 검색</h2>

      <div className="flex space-x-2 items-center">
        {/* 출발지 드롭다운 */}
        <select
          value={departure}
          onChange={e => setDeparture(e.target.value)}
          className="border p-2 rounded w-1/4">
          <option value="">출발 공항</option>
          {AIRPORT_LIST.map(airport => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
        </select>

        {/* 도착지 드롭다운 */}
        <select
          value={arrival}
          onChange={e => setArrival(e.target.value)}
          className="border p-2 rounded w-1/4">
          <option value="">도착 공항</option>
          {AIRPORT_LIST.map(airport => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
        </select>

        {/* 날짜 선택 */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border p-2 rounded w-1/4"
        />

        {/* ✅ 인원 선택 드롭다운 */}
        <select
          value={passengers}
          onChange={e => setPassengers(Number(e.target.value))}
          className="border p-2 rounded w-1/5">
          {[...Array(9)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}명
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          검색
        </button>
      </div>

      {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}

      {/* ✅ 로딩 화면 표시 */}
      {loading && <LoadingScreen />}
    </div>
  );
};

export default FlightSearch;
