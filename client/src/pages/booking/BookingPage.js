// 예약 및 결제창 출력 페이지

import React from 'react';
import {useParams} from 'react-router-dom';
import TourTicketBookingForm from '../../components/booking/TourTicketBookingForm';

const BookingPage = () => {
  const {type} = useParams(); // URL에서 상품 타입 가져오기

  const renderBookingForm = () => {
    switch (type) {
      case 'tourTicket':
        <h1>📌 투어.티켓 예약</h1>;
        return <TourTicketBookingForm />;
      case 'flight':
      // return <FlightBookingForm />;
      case 'accommodation':
      // return <AccommodationBookingForm />;
      default:
        return <p>잘못된 상품 타입입니다.</p>;
    }
  };

  return (
    <div className="tour-ticket-booking-container">
      <h1>
        📌 {type === 'tourTicket' ? '투어.티켓' : type === 'flight' ? '항공편' : '숙박'}{' '}
        예약
      </h1>
      {renderBookingForm()}
    </div>
  );
};

export default BookingPage;
