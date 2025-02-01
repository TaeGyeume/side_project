import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { airportData } from "../utils/airportData";
import '../styles/FlightSearch.css';

const FlightSearch = () => {
  const [tripType, setTripType] = useState("oneway"); 
  const [departure, setDeparture] = useState(""); 
  const [arrival, setArrival] = useState(""); 
  const [departureDate, setDepartureDate] = useState(""); 
  const [returnDate, setReturnDate] = useState(""); 
  const [passengers, setPassengers] = useState(1); 
  const navigate = useNavigate();

  // 공항 코드 변환 함수 (입력값이 도시명/공항명/공항 코드인 경우 처리)
  const convertToAirportCode = (input) => {
    if (!input) return "";
  
    // 입력값을 소문자로 변환하여 검색
    const lowerInput = input.trim().toLowerCase();
  
    const found = airportData.find(
      (airport) =>
        airport.city.toLowerCase() === lowerInput ||  // 도시명과 완전히 일치
        airport.airport.toLowerCase() === lowerInput ||  // 공항 코드와 일치
        airport.fullName.toLowerCase().includes(lowerInput)  // 공항 이름 포함
    );
  
    return found ? found.airport : input.toUpperCase();
  };

  const handleSearch = () => {
    if (!departure || !arrival || !departureDate) {
      alert("출발지, 도착지, 가는 날을 입력해주세요.");
      return;
    }

    const formattedDeparture = convertToAirportCode(departure);
    const formattedArrival = convertToAirportCode(arrival);

    let query = `/flights?departure=${formattedDeparture}&arrival=${formattedArrival}&date=${departureDate}&passengers=${passengers}`;
    
    if (tripType === "roundtrip" && returnDate) {
      query += `&returnDate=${returnDate}`;
    }

    navigate(query);
  };

  return (
    <div className="search-container">
      <div className="trip-type">
        <label>
          <input
            type="radio"
            name="tripType"
            value="oneway"
            checked={tripType === "oneway"}
            onChange={() => setTripType("oneway")}
          />
          편도
        </label>
        <label>
          <input
            type="radio"
            name="tripType"
            value="roundtrip"
            checked={tripType === "roundtrip"}
            onChange={() => setTripType("roundtrip")}
          />
          왕복
        </label>
      </div>

      <div className="search-options">
        <input 
          type="text" 
          placeholder="출발지 (예: 인천, ICN)" 
          value={departure} 
          onChange={(e) => setDeparture(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="도착지 (예: 뉴욕, JFK)" 
          value={arrival} 
          onChange={(e) => setArrival(e.target.value)} 
        />
        <input 
          type="date" 
          value={departureDate} 
          onChange={(e) => setDepartureDate(e.target.value)} 
        />
        
        {tripType === "roundtrip" && (
          <input 
            type="date" 
            value={returnDate} 
            onChange={(e) => setReturnDate(e.target.value)} 
          />
        )}

        <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>{num}명</option>
          ))}
        </select>
        <button onClick={handleSearch} className="search-button">항공권 검색</button>
      </div>
    </div>
  );
};

export default FlightSearch;
