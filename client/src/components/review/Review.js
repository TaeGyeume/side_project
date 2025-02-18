import React, {useState, useEffect} from 'react';
import {getReviews, createReview} from '../../api/review/reviewService';

const ReviewComponent = ({productType, productId, userId, bookingId}) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await getReviews(productType, productId);
      setReviews(data);
    };

    fetchReviews();
  }, [productType, productId]);

  const handleSubmit = async () => {
    try {
      const reviewData = {bookingId, userId, productId, rating, content};
      await createReview(productType, reviewData);
      alert('리뷰 작성 완료!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('리뷰 작성 실패');
    }
  };

  return (
    <div className="review-component">
      <h2>리뷰</h2>
      <ul>
        {reviews.map(review => (
          <li key={review._id}>
            <strong>{review.userId}</strong> - {review.rating}점<p>{review.content}</p>
          </li>
        ))}
      </ul>
      <div className="review-form">
        <input
          type="number"
          value={rating}
          onChange={e => setRating(e.target.value)}
          min="1"
          max="5"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="리뷰 작성..."
        />
        <button onClick={handleSubmit}>리뷰 작성</button>
      </div>
    </div>
  );
};

export default ReviewComponent;
