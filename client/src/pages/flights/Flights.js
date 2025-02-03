import React, { useEffect, useState } from "react";
import { fetchFlights } from "../../api/flight/flights";

const Flights = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const getFlights = async () => {
      const data = await fetchFlights();
      setFlights(data);
    };
    getFlights();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">✈️ 항공편 리스트</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.length === 0 ? (
          <p className="text-gray-600">항공편 데이터를 불러오는 중...</p>
        ) : (
          flights.map((flight) => (
            <div key={flight.flightNumber} className="border p-4 rounded-lg shadow-md flex items-center space-x-4">
              <img src={flight.airlineLogo} alt={flight.airline} className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-semibold">{flight.airline} ({flight.flightNumber})</h3>
                <p className="text-gray-600">{flight.departure.city} → {flight.arrival.city}</p>
                <p className="text-gray-500">🕒 {new Date(flight.departure.time).toLocaleTimeString()} → {new Date(flight.arrival.time).toLocaleTimeString()} ({flight.flightDuration})</p>
                <p className="text-gray-700">좌석: {flight.seatsAvailable}석 | {flight.seatClass}</p>
                <p className="text-lg font-bold text-blue-600">{flight.price.toLocaleString()}원</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Flights;
