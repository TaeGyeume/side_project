import React, { useState } from "react";
import "../../styles/FlightSearch.css";

const FlightSearch = ({ onSearch }) => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    onSearch({ departure, arrival, date });
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">✈️ 항공편 검색</h2>
      
      {/* 🔹 Flexbox를 활용하여 가로 정렬 */}
      <div className="flex space-x-2 items-center">
        <input
          type="text"
          placeholder="출발 공항 (예: GMP)"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="border p-2 rounded w-1/4"
        />
        <input
          type="text"
          placeholder="도착 공항 (예: CJU)"
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
        
        {/* 🔹 버튼을 input과 같은 줄에 정렬 */}
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
          검색
        </button>
      </div>
    </div>
  );
};

export default FlightSearch;