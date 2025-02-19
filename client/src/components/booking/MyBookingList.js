import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  getMyBookings,
  cancelBooking,
  confirmBooking
} from '../../api/booking/bookingService';
import {getReviews} from '../../api/review/reviewService';
import {useReviewContext} from '../../contexts/ReviewContext';
import {useAuthStore} from '../../store/authStore';
import './styles/MyBookingList.css';

const MyBookingList = ({status}) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {reviewStatus, setReviewStatus} = useReviewContext();
  const navigate = useNavigate();

  const {user} = useAuthStore(); // authStore에서 user 정보 가져오기
  const userId = user?._id; // user 객체에서 userId 추출
  console.log('setReviewStatus:', setReviewStatus);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        if (!data || data.length === 0) return;

        const reviewsStatus = {};

        await Promise.all(
          data.map(async booking => {
            await Promise.all(
              booking.productIds.map(async product => {
                const productId = product._id || product;
                const merchant_uid = booking.merchant_uid;

                console.log('Fetching reviews for:', {productId, merchant_uid});

                const reviews = await getReviews(productId.toString());

                if (!reviewsStatus[productId]) {
                  reviewsStatus[productId] = {};
                }

                // 유저 ID와 주문번호까지 고려해서 리뷰 작성 여부 체크
                const hasReview = reviews.some(
                  r =>
                    String(r.userId._id || r.userId) === String(userId) &&
                    r.bookingId.toString() === booking._id.toString()
                );

                reviewsStatus[productId][merchant_uid] = hasReview;
              })
            );
          })
        );

        console.log('Final reviewsStatus:', reviewsStatus);
        setReviewStatus(reviewsStatus);

        setBookings(data);
      } catch (err) {
        if (err.response && err.response.status === 404)
          setError('예약 내역이 없습니다.');
        else setError('예약 내역 불러오기 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [setReviewStatus, userId]);

  const handleCancel = async bookingId => {
    try {
      const response = await cancelBooking(bookingId);
      if (response.status === 200) {
        alert('예약이 정상적으로 취소되었습니다.');
        setBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId ? {...booking, paymentStatus: 'CANCELED'} : booking
          )
        );
      } else {
        alert(`예약 취소 실패: ${response.message}`);
      }
    } catch (error) {
      alert(`예약 취소 오류 발생: ${error.message}`);
    }
  };

  const handleConfirm = async bookingId => {
    try {
      const response = await confirmBooking(bookingId);
      if (response.status === 200) {
        alert('구매가 확정되었습니다.');
        setBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId ? {...booking, paymentStatus: 'CONFIRMED'} : booking
          )
        );
      } else {
        alert(`구매 확정 실패: ${response.message}`);
      }
    } catch (error) {
      alert('구매 확정 중 오류 발생');
    }
  };

  const handleReview = (productId, bookingId) => {
    navigate(`/reviews/create?productId=${productId}&bookingId=${bookingId}`);
  };

  if (loading) return <p className="loading-text">로딩 중...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const filteredBookings = bookings
    .filter(booking => {
      if (status === 'completed') {
        return (
          booking.paymentStatus === 'COMPLETED' || booking.paymentStatus === 'CONFIRMED'
        );
      } else if (status === 'canceled') {
        return booking.paymentStatus === 'CANCELED';
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="booking-list-container">
      <h2>{status === 'completed' ? '📌 예약 완료' : '❌ 예약 취소'}</h2>
      {filteredBookings.length === 0 ? (
        <p className="no-bookings">해당하는 예약이 없습니다.</p>
      ) : (
        <div className="booking-grid">
          {filteredBookings.map(booking => (
            <div
              key={booking._id}
              className={`booking-card ${status === 'canceled' ? 'canceled' : status === 'confirmed' ? 'confirmed' : ''}`}>
              <div className="booking-header">
                <span className="booking-date">
                  주문 일자:&nbsp;
                  {new Date(booking.createdAt)
                    .toISOString()
                    .replace('T', ' | ')
                    .substring(0, 21)}
                </span>
                {status === 'completed' && booking.paymentStatus === 'COMPLETED' && (
                  <div className="booking-buttons">
                    <button
                      className="confirm-button"
                      onClick={() => handleConfirm(booking._id)}>
                      구매 확정
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => handleCancel(booking._id)}>
                      예약 취소
                    </button>
                  </div>
                )}
                {status === 'completed' && booking.paymentStatus === 'CONFIRMED' && (
                  <div className="booking-buttons">
                    {booking.types.includes('flight') ? (
                      /* 항공 상품이면 리뷰 버튼 없이 구매 확정 완료 버튼 유지 */
                      <button className="confirm-button" disabled>
                        구매 확정 완료
                      </button>
                    ) : (reviewStatus?.[booking.productIds[0]._id]?.[
                        booking.merchant_uid
                      ] ?? false) ? (
                      /* 이미 해당 주문 건에 대한 리뷰를 작성한 경우 */
                      <button className="review-done-button" disabled>
                        리뷰 작성 완료
                      </button>
                    ) : (
                      /* 리뷰 작성 가능한 경우 */
                      <button
                        className="review-button"
                        onClick={() =>
                          handleReview(booking.productIds[0]._id, booking._id)
                        }>
                        리뷰 작성
                      </button>
                    )}
                  </div>
                )}
              </div>
              {booking.productIds.map((product, idx) => (
                <React.Fragment key={idx}>
                  {idx === 0 ? (
                    <div className="booking-content">
                      <p>주문번호: {booking.merchant_uid}</p>
                      <p>수량: {booking.counts.length}개</p>
                      <p>가격: {booking.totalPrice.toLocaleString()} 원</p>
                      <strong>
                        {booking.paymentStatus === 'COMPLETED'
                          ? '🟢 완료'
                          : booking.paymentStatus === 'CANCELED'
                            ? '🔴 취소됨'
                            : booking.paymentStatus === 'CONFIRMED'
                              ? '🔵 구매 확정'
                              : ''}
                      </strong>
                    </div>
                  ) : idx === 1 ? (
                    <div className="booking-content">
                      <br />
                      <p>그 외 상품 {booking.productIds.length - 1}개</p>
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
              <div className="booking-footer">
                <a href={`/booking/detail/${booking._id}`} className="detail-link">
                  {'>> 상세 페이지로 이동'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingList;
