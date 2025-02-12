// 내 여행 목록
// 현재 일자 기준으로 [예정된 여행], [지난 여행], [취소된 여행]으로 구분

import React from 'react';
import MyBookingList from '../../components/booking/MyBookingList';

const MyBookingPage = () => {
  return (
    <div className="my-bookings">
      <MyBookingList />
    </div>
  );
};

export default MyBookingPage;
