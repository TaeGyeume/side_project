import React, {useEffect, useState} from 'react';
import {getTourTicketById} from '../../api/tourTicket/tourTicketService';
import {getReviews} from '../../api/review/reviewService';
import {useParams, useNavigate} from 'react-router-dom';
import {useReviewContext} from '../../contexts/ReviewContext';
import authAPI from '../../api/auth/auth';
import './styles/TourTicketDetail.css';
import ReviewList from '../../components/review/ReviewList';

const TourTicketDetail = () => {
  const {id} = useParams();
  const {reviewStatus, setReviewStatus} = useReviewContext();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 이미지 인덱스
  const [user, setUser] = useState(null); // 사용자 정보 저장

  useEffect(() => {
    // 로그인된 사용자 정보 가져오기
    const fetchUserProfile = async () => {
      try {
        const userProfile = await authAPI.getUserProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };

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

        const updatedReviewStatus = {};

        // 유저 정보가 있을 때만 리뷰 상태 확인
        if (user && user._id) {
          data.forEach(review => {
            if (review.userId._id === user._id) {
              const key = `${review.productId}_${review.bookingId}`;
              updatedReviewStatus[key] = true;
            }
          });
        }

        setReviewStatus(prev => ({...prev, ...updatedReviewStatus}));
      } catch (err) {
        console.error('리뷰 조회 오류:', err);
      }
    };

    fetchUserProfile().then(() => {
      fetchTicket();
      fetchReviews();
    });
  }, [id, setReviewStatus]);

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

  // 현재 예약 건에 대한 리뷰 여부 체크
  const hasReview = user
    ? Object.keys(reviewStatus).some(key => key.startsWith(`${id}_`) && reviewStatus[key])
    : false;

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
