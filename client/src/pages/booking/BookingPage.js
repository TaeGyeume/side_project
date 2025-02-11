// 예약 및 결제창 출력 페이지

import React from 'react';
import BookingForm from '../../components/booking/BookingForm';

const BookingPage = () => {
  return (
    <div className="tour-ticket-booking-container">
      <h1>📌 투어.티켓 예약</h1>
      <BookingForm />
    </div>
  );
};

export default BookingPage;
