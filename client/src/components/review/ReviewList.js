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
        const data = await getReviews(productId);
        console.log('리뷰 데이터:', data);
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
      {reviews.length === 0 ? (
        <p className="no-reviews">등록된 리뷰가 없습니다.</p>
      ) : (
        reviews.map(review => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <span className="review-username">
                {review.userId.username || '익명 사용자'}
              </span>
            </div>

            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000${image}`}
                    alt={`리뷰 이미지 ${index + 1}`}
                    className="review-thumbnail"
                  />
                ))}
              </div>
            )}

            <p className="review-text">{review.content}</p>

            <button className="like-button" onClick={() => handleLike(review._id)}>
              <AiOutlineLike /> {review.likes || 0}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
