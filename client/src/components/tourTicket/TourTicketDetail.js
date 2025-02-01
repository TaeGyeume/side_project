import React from 'react';
import {useNavigate} from 'react-router-dom';
import './styles/TourTicketDetail.css';

const TourTicketDetail = ({ticket, isAdmin}) => {
  const navigate = useNavigate();

  return (
    <div className="tour-ticket-detail-container">
      <button
        className="back-button"
        onClick={() =>
          navigate(isAdmin ? '/product/tourTicket/list' : '/tourTicket/list')
        }>
        뒤로가기
      </button>

      <h2>{ticket.title}</h2>

      <img
        src={`http://localhost:5000${ticket.images[0]}`}
        alt={ticket.title}
        className="ticket-detail-image"
      />

      <div className="ticket-detail-info">
        <p>
          <strong>가격:</strong> {ticket.price.toLocaleString()} 원
        </p>
        <p>
          <strong>재고:</strong> {ticket.stock} 개
        </p>
        <p>
          <strong>설명:</strong> {ticket.description || '설명이 없습니다.'}
        </p>
        <p>
          <strong>위치:</strong> {ticket.location}
        </p>
      </div>

      {isAdmin && (
        <button
          className="edit-button"
          onClick={() => navigate(`/product/tourTicket/modify/${ticket._id}`)}>
          수정하기
        </button>
      )}
    </div>
  );
};

export default TourTicketDetail;
