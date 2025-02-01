import React, {useEffect, useState} from 'react';
import {getTourTicketById} from '../../api/tourTicket/tourTicketService';
import {useParams, useNavigate} from 'react-router-dom';

const TourTicketDetail = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTourTicketById(id);
        setTicket(data);
      } catch (error) {
        console.error('상품 정보를 가져오는 중 오류 발생:', error);
      }
    };
    fetchTicket();
  }, [id]);

  if (!ticket) {
    return <p>상품 정보를 불러오는 중...</p>;
  }

  return (
    <div className="tour-ticket-detail">
      <h1>{ticket.title}</h1>
      <img src={`http://localhost:5000${ticket.images[0]}`} alt={ticket.title} />
      <p>가격: {ticket.price.toLocaleString()} 원</p>
      <p>재고: {ticket.stock} 개</p>
      <p>{ticket.description}</p>

      {/* ✅ "수정하기" 버튼 추가 */}
      <button onClick={() => navigate(`/product/tourTicket/modify/${id}`)}>
        수정하기
      </button>
    </div>
  );
};

export default TourTicketDetail;
