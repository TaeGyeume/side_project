import React, {useEffect, useState} from 'react';
import {getTourTickets} from '../../../api/tourTicket/tourTicketService';
import {useNavigate} from 'react-router-dom';
import '../tourTicket/styles/TourTicketList.css';

const TourTicketList = () => {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getTourTickets();
        setTickets(data);
      } catch (error) {
        console.error('상품 목록을 가져오는 중 오류 발생:', error);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="tour-ticket-container">
      <h1>투어 & 티켓 상품 목록</h1>
      <button
        onClick={() => navigate('/product/tourTicket/new')}
        style={{marginBottom: '20px'}}>
        상품 등록
      </button>

      <div className="tour-ticket-grid">
        {tickets.length > 0 ? (
          tickets.map(ticket => (
            <div
              key={ticket._id}
              className="tour-ticket-card"
              onClick={() => navigate(`/product/tourTicket/${ticket._id}`)}>
              <img
                src={`http://localhost:5000${ticket.images[0]}`}
                alt={ticket.title}
                className="ticket-image"
              />
              <div className="ticket-info">
                <h3 className="ticket-title">{ticket.title}</h3>
                <p className="ticket-description">✏️ {ticket.description}</p>
                <p className="ticket-price">{ticket.price.toLocaleString()} 원</p>
                <p className="ticket-stock">재고: {ticket.stock} 개</p>
              </div>
            </div>
          ))
        ) : (
          <p>등록된 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TourTicketList;
