import React, {useEffect, useState} from 'react';
import {getTourTickets} from '../../api/tourTicket/tourTicketService';
import TourTicketList from '../../components/TourTicketList';

const UserTourTicketList = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const data = await getTourTickets();
      setTickets(data);
    };

    fetchTickets();
  }, []);

  return <TourTicketList tickets={tickets} isAdmin={false} />;
};

export default UserTourTicketList;
