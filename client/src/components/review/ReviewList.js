// src/components/review/ReviewList.js
import React, {useEffect, useState} from 'react';
import {getReviews, likeReview} from '../../api/review/reviewService';
import {AiOutlineLike} from 'react-icons/ai';
import './styles/ReviewList.css';

const ReviewList = ({productId}) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log('현재 productId:', productId); // 디버깅
        const data = await getReviews(productId);
        setReviews(data);
      } catch (err) {
        console.error('리뷰 조회 오류:', err);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleLike = async reviewId => {
    try {
      const data = await likeReview(reviewId);
      setReviews(reviews.map(r => (r._id === reviewId ? {...r, likes: data.likes} : r)));
    } catch (err) {
      alert('좋아요 처리 실패');
    }
  };

  return (
    <div className="review-list">
      {reviews.map(review => (
        <div key={review._id} className="review-card">
          {review.images.length > 0 && (
            <img src={review.images[0]} alt="리뷰 이미지" className="review-image" />
          )}
          <div className="review-content">
            <p className="review-user">@{review.userId}</p>
            <p className="review-text">{review.content}</p>

            <button className="like-button" onClick={() => handleLike(review._id)}>
              <AiOutlineLike /> {review.likes || 0}
            </button>
          </div>
          <div className="comments-section">
            {/* TODO: 댓글 목록 표시 및 관리자만 댓글 작성 */}
            <p>댓글 표시 예정</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
