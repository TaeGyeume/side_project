import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import FlightSearch from '../../components/flights/FlightSearch';
import FlightList from '../../components/flights/FlightList';
import {fetchFlights} from '../../api/flight/flights';
import moment from 'moment-timezone';

const Flights = () => {
  const [flights, setFlights] = useState([]); // 전체 항공편 데이터
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
