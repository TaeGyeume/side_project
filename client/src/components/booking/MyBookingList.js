import React, {useEffect, useState} from 'react';
import {getMyBookings, cancelBooking} from '../../api/booking/bookingService';
import './styles/MyBookingList.css';

const MyBookingList = ({status}) => {
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

  if (loading) return <p className="loading-text">로딩 중...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const filteredBookings = bookings
    .filter(booking =>
      status === 'completed'
        ? booking.paymentStatus === 'COMPLETED'
        : booking.paymentStatus === 'CANCELED'
    )
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
              className={`booking-card ${status === 'canceled' ? 'canceled' : ''}`}>
              <div className="booking-header">
                <span className="booking-date">
                  {new Date(booking.updatedAt).toLocaleDateString('ko-KR')}
                </span>
                {status === 'completed' && (
                  <button
                    className="cancel-button"
                    onClick={() => handleCancel(booking._id)}>
                    예약취소
                  </button>
                )}
              </div>
              {booking.productIds.map((product, idx) => (
                <div key={idx} className="booking-content">
                  {/* <h3 className="product-title">
                    {product.title || product.name || '상품 정보 없음'}
                  </h3> */}
                  <p>주문번호: {booking.merchant_uid}</p>
                  <p>수량: {booking.counts[idx]}개</p>
                  <p>가격: {booking.totalPrice.toLocaleString()} 원</p>
                  <strong>{status === 'completed' ? '✅ 완료' : '❌ 취소됨'}</strong>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingList;
