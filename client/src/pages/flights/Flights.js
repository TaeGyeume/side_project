import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {getFlights} from '../../api/flights';
import FlightSearch from '../../components/FlightSearch';

const Flights = () => {
  const [flights, setFlights] = useState([]);
  const location = useLocation();

  useEffect(() => {
    async function fetchFlights() {
      const queryParams = new URLSearchParams(location.search);
      const departure = queryParams.get('departure');
      const arrival = queryParams.get('arrival');
      const date = queryParams.get('date');
      const returnDate = queryParams.get('returnDate');
      const passengers = queryParams.get('passengers');

      // 왕복 검색 시 두 날짜를 검색
      const data = await getFlights({departure, arrival, date, returnDate, passengers});
      setFlights(data);
    }

    fetchFlights();
  }, [location.search]);

  return (
    <div>
      <h1>항공편 검색 결과</h1>
      <FlightSearch />
      <ul>
        {flights.length > 0 ? (
          flights.map(flight => (
            <li key={flight._id}>
              ✈️ {flight.airline} - {flight.flightNumber}
              <br />
              🛫 출발: {flight.departure.city} ({flight.departure.airport}) -{' '}
              {new Date(flight.departure.time).toLocaleString()}
              <br />
              🛬 도착: {flight.arrival.city} ({flight.arrival.airport}) -{' '}
              {new Date(flight.arrival.time).toLocaleString()}
              <br />
              💰 가격: {flight.price.toLocaleString()}원 | 좌석 수:{' '}
              {flight.seatsAvailable}석
              <hr />
            </li>
          ))
        ) : (
          <p>검색 결과가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default Flights;
