import React from 'react';
import TourTicketList from '../components/tourTicket/TourTicketList';
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">메인페이지입니다</h2>
      <div style={sectionStyle}>
        <h3>지역 필수 티켓</h3>
        <TourTicketList />
      </div>
    </div>
  );
};

export default Main;

const sectionStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  marginBottom: '20px',
  position: 'auto',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9'
};
