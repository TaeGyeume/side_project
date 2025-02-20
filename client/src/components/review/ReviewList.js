import React, {useEffect, useState} from 'react';
import {getReviews, likeReview, deleteReview} from '../../api/review/reviewService';
import {AiOutlineLike, AiOutlineMore} from 'react-icons/ai';
import './styles/ReviewList.css';
import authAPI from '../../api/auth/auth';

const ReviewList = ({productId}) => {
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState({});

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

    const fetchUser = async () => {
      try {
        const userProfile = await authAPI.getUserProfile();
        setCurrentUser(userProfile);
      } catch (err) {
        console.error('사용자 정보 조회 오류: ', err);
      }
    };

    fetchReviews();
    fetchUser();
  }, [productId]);

  const handleLike = async reviewId => {
    try {
      const data = await likeReview(reviewId);
      setReviews(reviews.map(r => (r._id === reviewId ? {...r, likes: data.likes} : r)));
    } catch (err) {
      alert('좋아요 처리 실패');
    }
  };

  const handleDelete = async reviewId => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await deleteReview(reviewId);
        setReviews(reviews.filter(review => review._id !== reviewId));
        alert('리뷰가 삭제되었습니다.');
      } catch (err) {
        alert('리뷰 삭제 실패');
      }
    }
  };

  const toggleMenu = reviewId => {
    setMenuOpen(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="review-list">
      {reviews.length === 0 ? (
        <p className="no-reviews">등록된 리뷰가 없습니다.</p>
      ) : (
        reviews.map(review => {
          const isAuthor = currentUser?._id === review.userId._id;

          return (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <span className="review-username">
                  {review.userId.username || '익명 사용자'}
                </span>
                {new Date(review.createdAt).toISOString().substring(0, 10)}

                {/* ✅ 케밥 메뉴 (⋮) - 항상 표시 */}
                <div className="kebab-menu">
                  <AiOutlineMore
                    onClick={() => toggleMenu(review._id)}
                    className="kebab-icon"
                  />

                  {/* ✅ 드롭다운 메뉴 */}
                  {menuOpen[review._id] && (
                    <div className="dropdown-menu">
                      {/* 작성자 권한 */}
                      {isAuthor && (
                        <>
                          <div
                            className="dropdown-item"
                            onClick={() => alert('수정 기능 구현 예정')}>
                            수정하기
                          </div>
                          <div
                            className="dropdown-item delete"
                            onClick={() => handleDelete(review._id)}>
                            삭제하기
                          </div>
                        </>
                      )}

                      {/* 관리자 권한 */}
                      {isAdmin && !isAuthor && (
                        <>
                          <div
                            className="dropdown-item"
                            onClick={() => alert('댓글 달기 기능 구현 예정')}>
                            댓글 달기
                          </div>
                          <div
                            className="dropdown-item delete"
                            onClick={() => handleDelete(review._id)}>
                            삭제하기
                          </div>
                        </>
                      )}

                      {/* 일반 사용자 - 아무 메뉴 없음 */}
                      {!isAuthor && !isAdmin && (
                        <div className="dropdown-item disabled">메뉴 없음</div>
                      )}
                    </div>
                  )}
                </div>
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
          );
        })
      )}
    </div>
  );
};

export default ReviewList;
