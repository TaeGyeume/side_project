import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import FlightSearch from '../../components/flights/FlightSearch';
import RoundTripSearch from '../../components/flights/RoundTripSearch';
// import FlightList from '../../components/flights/FlightList';
import FlightCardList from '../../components/flights/FlightCardList';
import {fetchFlights} from '../../api/flight/flights';
import moment from 'moment-timezone';
import {ToggleButton, ToggleButtonGroup} from '@mui/material';

const Flights = () => {
  const [flights, setFlights] = useState([]); // 전체 항공편 데이터
  const [isRoundTrip, setIsRoundTrip] = useState(false); // ✅ 왕복 여부 상태 추가
  const navigate = useNavigate(); // ✅ 검색 후 페이지 이동을 위한 useNavigate

  useEffect(() => {
    const getFlights = async () => {
      try {
        const data = await fetchFlights();
        setFlights(data || []);
      } catch (error) {
        console.error('🚨 항공편 데이터를 불러오는 데 실패:', error);
      }
    };
    getFlights();
  }, []);

  // ✅ 검색 핸들러: 입력한 출발, 도착, 날짜, 인원수에 맞는 항공편 필터링
  const handleSearch = ({departure, arrival, date, passengers}) => {
    console.log('🔍 검색 요청:', {departure, arrival, date, passengers});

    const formattedDate = moment(date, 'YYYY-MM-DD').startOf('day').utc().toISOString();

    const filtered = flights.filter(flight => {
      return (
        (!departure || flight.departure.airport === departure) &&
        (!arrival || flight.arrival.airport === arrival) &&
        (!date ||
          moment(flight.departure.date).utc().startOf('day').toISOString() ===
            formattedDate) &&
        (!passengers || flight.seatsAvailable >= passengers) // 좌석 수 필터링 추가
      );
    });

    console.log('✅ 필터링된 항공편:', filtered);

    // ✅ 검색된 데이터를 state로 전달하며 결과 페이지로 이동
    navigate('/flights/results', {state: {flights: filtered}});
  };

  const handleTripChange = (_, newValue) => {
    if (newValue !== null) {
      setIsRoundTrip(newValue);
    }
  };

  return (
    <div className="container mt-4">
      {/* ✈️ 편도/왕복 선택 버튼 */}
      {/* <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setIsRoundTrip(false)}
          className={`px-4 py-2 rounded-lg ${
            !isRoundTrip ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
          }`}>
          편도
        </button>
        <button
          onClick={() => setIsRoundTrip(true)}
          className={`px-4 py-2 rounded-lg ${
            isRoundTrip ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
          }`}>
          왕복
        </button>
      </div> */}

      <ToggleButtonGroup
        value={isRoundTrip}
        exclusive
        onChange={handleTripChange}
        sx={{display: 'flex', justifyContent: 'center', mb: 2}}>
        <ToggleButton value={false} sx={{px: 4}}>
          편도
        </ToggleButton>
        <ToggleButton value={true} sx={{px: 4}}>
          왕복
        </ToggleButton>
      </ToggleButtonGroup>

      {/* 🔍 편도 검색 or 왕복 검색 */}
      {isRoundTrip ? <RoundTripSearch /> : <FlightSearch onSearch={handleSearch} />}

      <FlightCardList flights={flights} />
    </div>
  );
};

export default Flights;
