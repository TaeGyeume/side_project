import React, {useEffect, useState} from 'react';
import {getMyBookings} from '../../api/booking/bookingService';

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

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>🛒 내 예약 목록</h2>
      {bookings.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <ul>
          {bookings.map(booking => (
            <li key={booking._id}>
              <strong>상품명:</strong> {booking.productId?.title || booking.productId?.name || '상품 정보 없음'}{' '}
              <br />
              <strong>예약 상태:</strong> {booking.paymentStatus} <br />
              <strong>총 가격:</strong> {booking.totalPrice}원 <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookingList;
