import React from 'react';
import {useLocation} from 'react-router-dom';
import FlightBookingForm from '../../components/booking/FlightBookingForm';

const FlightBookingPage = () => {
  const location = useLocation();
  console.log('전달된 state 확인:', location.state); // 디버깅용 로그 추가

  const {
    selectedDeparture,
    selectedReturn,
    passengers,
    isRoundTrip,
    selectedFlight,
    totalPrice
  } = location.state || {};

  // 항공편 정보가 없을 경우 에러 메시지 출력
  if (!selectedDeparture && !selectedFlight) {
    return (
      <div className="text-center mt-5">
        <h1>✈️ 항공편 예약</h1>
        <p className="text-danger">항공편 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flight-booking-container">
      <h1>✈️ 항공편 예약</h1>
      <FlightBookingForm
        selectedDeparture={selectedDeparture}
        selectedReturn={selectedReturn} // 왕복 항공편 정보 전달
        passengers={passengers}
        isRoundTrip={isRoundTrip}
        selectedFlight={selectedFlight}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default FlightBookingPage;
