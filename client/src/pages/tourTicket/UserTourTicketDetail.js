import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import TourTicketDetail from '../../components/TourTicketDetail';

const UserTourTicketDetail = () => {
  const {id} = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/tourTicket/list/${id}`)
      .then(response => response.json())
      .then(data => setTicket(data))
      .catch(error => console.error('상품 상세 조회 오류:', error));
  }, [id]);

  if (!ticket) return <p>상품 정보를 불러오는 중...</p>;

  return <TourTicketDetail ticket={ticket} isAdmin={false} />;
};

export default UserTourTicketDetail;
