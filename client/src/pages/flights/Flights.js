import React, { useEffect, useState } from "react";
import FlightSearch from "../../components/flights/FlightSearch"; // 🔍 검색 컴포넌트 추가
import FlightList from "../../components/flights/FlightList";
import { fetchFlights } from "../../api/flight/flights"; // ✅ API 가져오기

const Flights = () => {
  const [flights, setFlights] = useState([]); // 전체 항공편 데이터
  const [filteredFlights, setFilteredFlights] = useState([]); // 검색된 항공편 데이터

  useEffect(() => {
    const getFlights = async () => {
      const data = await fetchFlights();
      setFlights(data);
      setFilteredFlights(data); // 기본적으로 모든 항공편을 표시
    };
    getFlights();
  }, []);

  // ✅ 검색 핸들러: 입력한 출발, 도착, 날짜에 맞는 항공편 필터링
  const handleSearch = ({ departure, arrival, date }) => {
    console.log("🔍 검색 요청:", { departure, arrival, date });

    const filtered = flights.filter(flight => {
      return (
        (!departure || flight.departure.airport.includes(departure)) &&
        (!arrival || flight.arrival.airport.includes(arrival)) &&
        (!date || flight.departure.time.startsWith(date)) // 날짜 비교
      );
    });

    setFilteredFlights(filtered);
  };

  return (
    <div>
      <h1>항공편 리스트</h1>

      {/* 🔍 검색 컴포넌트 추가 */}
      <FlightSearch onSearch={handleSearch} />

      {/* 🛫 검색된 항공편 리스트만 전달 */}
      <FlightList flights={filteredFlights} />
    </div>
  );
};

export default Flights;
