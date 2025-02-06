import React from 'react';
import moment from 'moment-timezone';

const SearchResultsList = ({ flights }) => {
  return (
    <div>
      <h2>📋 검색된 항공편 리스트</h2>

      {flights.length === 0 ? (
        <p>🚫 검색된 항공편이 없습니다.</p>
      ) : (
        <div className="row">
          {flights.map((flight) => (
            <div key={flight._id} className="col-md-6 mb-3">
              <div className="card p-3 shadow">
                <h5 className="card-title">
                  {flight.airline} ({flight.flightNumber})
                </h5>
                <p>🛫 {flight.departure.city} → 🛬 {flight.arrival.city}</p>
                <p>
                  🕒 {moment(flight.departure.time).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')}
                  → {moment(flight.arrival.time).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')}
                </p>
                <p>💺 좌석 등급: {flight.seatClass} ({flight.seatsAvailable}석 남음)</p>
                <p className="text-primary font-weight-bold">💰 {flight.price.toLocaleString()}원</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsList;
