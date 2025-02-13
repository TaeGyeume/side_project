// 내 여행 목록

import React from 'react';
import {useLocation} from 'react-router-dom';
import MyBookingList from '../../components/booking/MyBookingList';
import BookingSidebar from '../../components/booking/BookingSidebar';
import './styles/MyBookingPage.css';

const MyBookingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status');

  return (
    <div className="booking-page">
      <BookingSidebar />
      <div className="booking-content">
        <MyBookingList status={status} />
      </div>
    </div>
  );
};

export default MyBookingPage;
