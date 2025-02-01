import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Flights from '../pages/flights/Flights';
import Reservation from '../pages/reservations/Reservation';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/flights" element={<Flights />} />
        <Route path="/reservation/:flightId" element={<Reservation />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
