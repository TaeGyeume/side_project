import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import FlightSearch from '../../components/flights/FlightSearch';
import FlightList from '../../components/flights/FlightList';
import {fetchFlights} from '../../api/flight/flights';

const Flights = () => {
  const [flights, setFlights] = useState([]); // 전체 항공편 데이터
  const navigate = useNavigate(); // ✅ 검색 후 페이지 이동을 위한 useNavigate

  useEffect(() => {
    const getFlights = async () => {
      const data = await fetchFlights();
      setFlights(data);
    };
    getFlights();
  }, []);

  // ✅ 검색 핸들러: 입력한 출발, 도착, 날짜에 맞는 항공편 필터링 후 페이지 이동
  const handleSearch = ({departure, arrival, date}) => {
    console.log('🔍 검색 요청:', {departure, arrival, date});

    const filtered = flights.filter(flight => {
      return (
        (!departure || flight.departure.airport.includes(departure)) &&
        (!arrival || flight.arrival.airport.includes(arrival)) &&
        (!date || flight.departure.time.startsWith(date)) // 날짜 비교
      );
    });

    // ✅ 검색된 데이터를 state로 전달하며 결과 페이지로 이동
    navigate('/flights/results', {state: {flights: filtered}});
  };

  return (
    <div>
      {/* 🔍 검색 컴포넌트 추가 */}
      <FlightSearch onSearch={handleSearch} />

      {/* 🛫 모든 항공편 표시 */}
      <FlightList flights={flights} />
    </div>
  );
};

export default Flights;
