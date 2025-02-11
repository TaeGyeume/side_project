import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import moment from 'moment-timezone';
import './styles/FlightSearch.css';
import {searchFlights} from '../../api/flight/flights';
import LoadingScreen from './LoadingScreen';

// ✅ 공항 한글 → 코드 변환
const AIRPORT_CODES = {
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

const AIRPORT_LIST = Object.keys(AIRPORT_CODES);

const FlightSearch = () => {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    console.log('🔍 검색 요청:', {departure, arrival, date, passengers});

    // ✅ 필수 입력값 검증
    if (!departure || !arrival || !date || passengers < 1) {
      setErrorMessage('출발지, 도착지, 날짜, 인원수를 입력해주세요.');
      return;
    }

    // ✅ 출발지와 도착지가 같은 경우 예외 처리
    if (departure === arrival) {
      setErrorMessage('출발지와 도착지는 같을 수 없습니다.');
      return;
    }

    const deptCode = AIRPORT_CODES[departure] || departure;
    const arrCode = AIRPORT_CODES[arrival] || arrival;
    const formattedDate = moment(date).format('YYYY-MM-DD');

    // ✅ 날짜 형식 검증
    if (!moment(formattedDate, 'YYYY-MM-DD', true).isValid()) {
      setErrorMessage('🚨 잘못된 날짜 형식입니다. YYYY-MM-DD 형식이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      console.log(`✅ 변환된 검색 날짜: ${formattedDate}`);

      // ✅ API 요청에 passengers 값 추가
      const searchData = await searchFlights(
        deptCode,
        arrCode,
        formattedDate,
        passengers
      );

      if (!searchData || searchData.length === 0) {
        setErrorMessage(
          `🚫 선택한 날짜 (${formattedDate})에 운항하는 항공편이 없습니다.`
        );
        setLoading(false);
      } else {
        setErrorMessage('');
        console.log('✅ 검색된 데이터:', searchData);
        setTimeout(() => {
          navigate('/flights/results', {state: {flights: searchData}});
        }, 5000);
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

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border p-2 rounded w-1/4"
        />

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
      {loading && <LoadingScreen />}
    </div>
  );
};

export default FlightSearch;
