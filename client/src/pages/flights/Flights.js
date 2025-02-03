import React, {useEffect, useState} from 'react';
import FlightSearch from '../../components/flights/FlightSearch'; // ✅ 올바른 import 경로 확인
import {fetchFlights} from '../../api/flight/flights';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);

  useEffect(() => {
    const getFlights = async () => {
      const data = await fetchFlights();
      setFlights(data);
      setFilteredFlights(data); // 초기에는 전체 데이터 표시
    };
    getFlights();
  }, []);

  // ✅ `handleSearch` 함수 정의 (검색 기능 추가)
  const handleSearch = ({departure, arrival, date}) => {
    const filtered = flights.filter(flight => {
      return (
        (!departure || flight.departure.airport.includes(departure)) &&
        (!arrival || flight.arrival.airport.includes(arrival)) &&
        (!date || flight.departure.time.startsWith(date))
      );
    });
    setFilteredFlights(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      {/* 🔍 검색 컴포넌트 추가 */}
      <FlightSearch onSearch={handleSearch} />
      <h2 className="text-2xl font-bold mb-4">✈️ 항공편 리스트</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {filteredFlights.length === 0 ? (
          <p className="text-gray-600">검색 결과가 없습니다.</p>
        ) : (
          filteredFlights.map(flight => (
            <div
              key={flight.flightNumber}
              className="border p-4 rounded-lg shadow-md flex items-center space-x-4">
              <img src={flight.airlineLogo} alt={flight.airline} className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-semibold">
                  {flight.airline} ({flight.flightNumber})
                </h3>
                <p className="text-gray-600">
                  {flight.departure.city} → {flight.arrival.city}
                </p>
                <p className="text-gray-500">
                  🕒 {new Date(flight.departure.time).toLocaleTimeString()} →{' '}
                  {new Date(flight.arrival.time).toLocaleTimeString()}
                </p>
                <p className="text-gray-700">좌석: {flight.seatsAvailable}석</p>
                <p className="text-lg font-bold text-blue-600">
                  {flight.price.toLocaleString()}원
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Flights;
