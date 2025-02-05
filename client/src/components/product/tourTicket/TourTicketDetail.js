import React, {useEffect, useState} from 'react';
import {getTourTicketById} from '../../../api/tourTicket/tourTicketService';
import {useParams, useNavigate} from 'react-router-dom';
import './styles/TourTicketDetail.css';

const TourTicketDetail = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 이미지 인덱스

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

  useEffect(() => {
    if (!ticket || ticket.images.length <= 1) return; // 이미지가 하나면 슬라이드 X

    // const interval = setInterval(() => {
    //   setCurrentIndex(prevIndex => (prevIndex + 1) % ticket.images.length);
    // }, 2000);

    // return () => clearInterval(interval);
  }, [ticket]);

  if (!ticket) {
    return <p>상품 정보를 불러오는 중...</p>;
  }

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % ticket.images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? ticket.images.length - 1 : prevIndex - 1
    );
  };

  const handleDotClick = index => {
    setCurrentIndex(index);
  };

  return (
    <div className="tour-ticket-detail">
      <h1>{ticket.title}</h1>

      <div className="image-slider">
        <img
          src={`http://localhost:5000${ticket.images[currentIndex]}`}
          alt={ticket.title}
          className="slider-image"
        />

        {ticket.images.length > 1 && (
          <>
            <button className="prev-btn" onClick={handlePrev}>
              &lt;
            </button>
            <button className="next-btn" onClick={handleNext}>
              &gt;
            </button>
          </>
        )}

        <div className="dots-container">
          {ticket.images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>

      <p>설명: {ticket.description}</p>
      <p>가격: {ticket.price.toLocaleString()}원</p>
      <p>재고: {ticket.stock}개</p>

      <button onClick={() => navigate(`/product/tourTicket/modify/${id}`)}>
        수정하기
      </button>
      <button onClick={() => navigate('/product/tourTicket/list')}>상품 목록</button>
    </div>
  );
};

export default TourTicketDetail;
