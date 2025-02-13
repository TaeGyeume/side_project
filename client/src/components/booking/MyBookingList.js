import React, { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking } from '../../api/booking/bookingService';
import './styles/MyBookingList.css';

const MyBookingList = ({ status }) => {
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

  const handleCancel = async bookingId => {
    try {
      const response = await cancelBooking(bookingId);

      if (response.status === 200 || response.message.includes('결제가 취소되었습니다.')) {
        alert('예약이 정상적으로 취소되었습니다.');

        setBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId ? { ...booking, paymentStatus: 'CANCELED' } : booking
          )
        );

        console.log('예약 취소 성공:', response.message);
        return;
      } else {
        alert(`예약 취소 실패: ${response.message}`);
        console.error('예약 취소 실패:', response.message);
      }
    } catch (error) {
      alert(`예약 취소 오류 발생: ${error.message}`);
      console.error('예약 취소 오류:', error);
    }
  };

  if (loading) return <p className="loading-text">로딩 중...</p>;
  if (error) return <p className="error-text">{error}</p>;

  // 상태에 따라 예약 필터링
  const filteredBookings = bookings.filter(booking => {
    if (status === 'completed') return booking.paymentStatus === 'COMPLETED';
    if (status === 'canceled') return booking.paymentStatus === 'CANCELED';
    return false;
  });

  return (
    <div className="booking-list-container">
      <h2>{status === 'completed' ? '📌 예약 완료' : '❌ 예약 취소'}</h2>

      {filteredBookings.length === 0 ? (
        <p className="no-bookings">해당하는 예약이 없습니다.</p>
      ) : (
        <div className="booking-grid">
          {filteredBookings.map(booking => (
            <div className={`booking-card ${status === 'canceled' ? 'canceled' : ''}`} key={booking._id}>
              <div className="booking-header">
                <span className="booking-date">
                  {new Date(booking.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </span>
                {status === 'completed' && (
                  <button className="cancel-button" onClick={() => handleCancel(booking._id)}>
                    예약취소
                  </button>
                )}
              </div>

              <div className="booking-content">
                <h3 className="product-title">
                  {booking.productId?.title || booking.productId?.name || '상품 정보 없음'}
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
                  예약 상태: <strong>{status === 'completed' ? '✅ 완료' : '❌ 취소됨'}</strong>
                </p>
                <p>
                  총 가격: <strong>{booking.totalPrice.toLocaleString()} 원</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingList;
