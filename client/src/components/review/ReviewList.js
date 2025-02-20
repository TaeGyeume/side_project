import React, { useEffect, useState, useRef } from 'react';
import { getReviews, likeReview } from '../../api/review/reviewService';
import { AiOutlineLike, AiOutlineMore } from 'react-icons/ai';
import './styles/ReviewList.css';
import authAPI from '../../api/auth/auth';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState({}); // 열린 메뉴 상태

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

    const fetchCurrentUser = async () => {
      try {
        const user = await authAPI.getUserProfile();
        setCurrentUser(user);
      } catch (err) {
        console.error('사용자 정보 불러오기 오류:', err);
      }
    };

    fetchReviews();
    fetchCurrentUser();
  }, [productId]);

  const toggleMenu = (reviewId) => {
    setMenuOpen((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleLike = async (reviewId) => {
    try {
      const data = await likeReview(reviewId);
      setReviews((prevReviews) =>
        prevReviews.map((r) => (r._id === reviewId ? { ...r, likes: data.likes } : r))
      );
    } catch (err) {
      alert('좋아요 처리 실패');
    }
  };

  const handleEdit = (reviewId) => {
    alert(`리뷰 ${reviewId} 수정하기`);
  };

  const handleDelete = (reviewId) => {
    alert(`리뷰 ${reviewId} 삭제하기`);
  };

  const handleAddComment = (reviewId) => {
    alert(`리뷰 ${reviewId}에 댓글 추가`);
  };

  return (
    <div className="review-list">
      {reviews.length === 0 ? (
        <p className="no-reviews">등록된 리뷰가 없습니다.</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <span className="review-username">{review.userId.username || '익명 사용자'}</span>
              <span className="review-date">{new Date(review.createdAt).toISOString().substring(0, 10)}</span>
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

            <div className="review-actions">
              {/* 좋아요 버튼 */}
              <button className="like-button" onClick={() => handleLike(review._id)}>
                <AiOutlineLike /> {review.likes || 0}
              </button>

              {/* 케밥 메뉴 */}
              <div className="kebab-menu">
                <AiOutlineMore onClick={() => toggleMenu(review._id)} className="kebab-icon" />

                {menuOpen[review._id] && (
                  <div className="menu-options">
                    {currentUser &&
                    (currentUser.isAdmin || currentUser._id === review.userId._id) ? (
                      <>
                        {currentUser._id === review.userId._id && (
                          <>
                            <button onClick={() => handleEdit(review._id)}>수정하기</button>
                            <button onClick={() => handleDelete(review._id)}>삭제하기</button>
                          </>
                        )}
                        {currentUser.isAdmin && (
                          <>
                            <button onClick={() => handleAddComment(review._id)}>댓글 달기</button>
                            <button onClick={() => handleDelete(review._id)}>삭제하기</button>
                          </>
                        )}
                      </>
                    ) : (
                      <p>권한이 없습니다</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
