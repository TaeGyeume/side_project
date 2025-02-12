// 예약 및 결제창 출력 페이지

import React from 'react';
import TourTicketBookingForm from '../../components/booking/TourTicketBookingForm';

const TourTicketBookingPage = () => {
  return (
    <div className="tour-ticket-booking-container">
      <h1>📌 투어.티켓 예약</h1>
      <TourTicketBookingForm />
    </div>
  );
};

export default TourTicketBookingPage;
