import React, {useEffect, useState} from 'react';
import {getTourTicketById} from '../../api/tourTicket/tourTicketService';
import {getReviews} from '../../api/review/reviewService';
import {useParams, useNavigate} from 'react-router-dom';
import {useReviewContext} from '../../contexts/ReviewContext'; // Context 가져오기
import './styles/TourTicketDetail.css';
import ReviewList from '../../components/review/ReviewList';

const TourTicketDetail = () => {
  const {id} = useParams();
  const {reviewStatus, setReviewStatus} = useReviewContext();

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // 현재 로그인 사용자

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

    const fetchReviews = async () => {
      try {
        const data = await getReviews(id);
        const userReview = data.find(review => review.userId._id === userId);
        if (userReview) {
          setReviewStatus(prev => ({...prev, [id]: true})); // 리뷰 작성 상태 저장
        }
      } catch (err) {
        console.error('리뷰 조회 오류:', err);
      }
    };

    fetchTicket();
    fetchReviews();
  }, [id, userId, setReviewStatus]);

  useEffect(() => {
    if (!ticket || ticket.images.length <= 1) return; // 이미지가 하나면 슬라이드 X
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

  const handleReserve = () => {
    navigate(`/tourTicket/booking/${id}`);
  };

  const hasReview = reviewStatus[id]; // 해당 상품의 리뷰 여부 확인

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

      <button onClick={() => navigate('/tourTicket/list')}>상품 목록</button>

      {hasReview ? (
        <button className="completed-btn" disabled>
          리뷰 작성 완료
        </button>
      ) : (
        <button onClick={handleReserve} className="reserve-btn">
          예약하기
        </button>
      )}

      <div>
        <h2>📝 리뷰</h2>
        <ReviewList productId={id} />
      </div>
    </div>
  );
};

export default TourTicketDetail;
