import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import { fetchFlights } from "../../api/flight/flights"; // ✅ 올바른 import

const FlightList = () => {
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        console.log("📡 모든 항공편 데이터 가져오기...");
        const data = await fetchFlights();
        setFlights(data || []); // ✅ flights가 null이 아닐도록 기본값 설정
      } catch (error) {
        console.error("🚨 항공편 데이터를 불러오는 데 실패했습니다:", error);
      }
    };
    loadFlights();
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">✈️ 모든 항공편 리스트</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.length === 0 ? (
          <p className="text-gray-600">항공편 데이터가 없습니다.</p>
        ) : (
          flights.map((flight) => (
            <div key={flight?._id} className="border p-4 rounded-lg shadow-md flex items-center space-x-4">
              <img
                src={`/images/logos/${flight?.airline?.toLowerCase().replace(" ", "_")}.png`}
                alt={flight?.airline}
                className="w-12 h-12"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {flight?.airline} ({flight?.flightNumber})
                </h3>
                <p className="text-gray-600">
                  {flight?.departure?.city} → {flight?.arrival?.city}
                </p>
                <p className="text-gray-500">
                  🕒 {flight?.departure?.time ? moment(flight?.departure?.time).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm") : '시간 미정'}
                  → {flight?.arrival?.time ? moment(flight?.arrival?.time).tz("Asia/Seoul").format("YYYY-MM-DD HH:mm") : '시간 미정'}
                </p>
                <p className="text-gray-700">좌석: {flight?.seatsAvailable || '정보 없음'}석</p>
                <p className="text-lg font-bold text-blue-600">
                  {flight?.price ? flight.price.toLocaleString() : '0'}원
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FlightList;
