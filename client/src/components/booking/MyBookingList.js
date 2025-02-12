import React, {useEffect, useState} from 'react';
import {getMyBookings} from '../../api/booking/bookingService';
import './styles/MyBookingList.css'; // 스타일 적용

const MyBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('예약 정보를 불러오는 중 오류 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <p className="loading-text">로딩 중...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="booking-list-container">
      <h2>📌 내 예약 목록</h2>
      {bookings.length === 0 ? (
        <p className="no-bookings">현재 예약된 항목이 없습니다.</p>
      ) : (
        <div className="booking-grid">
          {bookings.map(booking => (
            <div className="booking-card" key={booking._id}>
              <div className="booking-header">
                <span className="booking-date">
                  {new Date(booking.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
                <button className="cancel-button">예약취소</button>
              </div>

              <div className="booking-content">
                <h3 className="product-title">
                  {booking.productId?.title ||
                    booking.productId?.name ||
                    '상품 정보 없음'}
                </h3>
                <p className={`type-label ${booking.type}`}>
                  {booking.type === 'flight'
                    ? '✈️ 항공권 예약'
                    : booking.type === 'accommodation'
                      ? '🏨 숙소 예약'
                      : booking.type === 'travelItem'
                        ? '🛍️ 여행용품 구매'
                        : '🎫 투어 티켓'}
                </p>
                <p>
                  예약 상태:{' '}
                  <strong>
                    {booking.paymentStatus === 'COMPLETED'
                      ? '✅ 완료'
                      : booking.paymentStatus === 'CANCELED'
                        ? '❌ 취소'
                        : '⏳ 결제 대기'}
                  </strong>
                </p>
                <p>
                  총 가격: <strong>{booking.totalPrice.toLocaleString()} 원</strong>
                </p>
              </div>

              <div className="booking-footer">
                <button className="detail-button">예약 상세 보기</button>
                <button className="inquiry-button">고객지원 문의</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingList;
