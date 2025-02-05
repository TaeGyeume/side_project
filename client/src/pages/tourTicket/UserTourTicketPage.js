import React from 'react';
import {Routes, Route} from 'react-router-dom';
import TourTicketList from '../../components/tourTicket/TourTicketList';
import TourTicketDetail from '../../components/tourTicket/TourTicketDetail';

const UserTourTicketPage = () => {
  return (
    <Routes>
      <Route path="/list" element={<TourTicketList />} />
      <Route path="/list/:id" element={<TourTicketDetail />} />
    </Routes>
  );
};

export default UserTourTicketPage;
