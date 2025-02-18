import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {getBookingDetails} from '../../api/booking/bookingService';

// 상품 유형 한글 변환 함수
const translateType = type => {
  const translations = {
    accommodation: '숙소',
    flight: '항공권',
    tourTicket: '투어/티켓',
    travelItem: '여행 용품'
  };
  return translations[type] || type;
};

// 결제 상태 한글 변환 함수
const translatePaymentStatus = status => {
  const translations = {
    PENDING: '결제 대기',
    COMPLETED: '결제 완료',
    CANCELED: '결제 취소',
    CONFIRMED: '예약 확정'
  };
  return translations[status] || status;
};

const BookingDetail = () => {
  const {bookingId} = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 숙소 상세 페이지로 이동하는 함수
  const handleAccommodationClick = accommodation => {
    if (!accommodation?._id) return; // ID가 없는 경우 이동하지 않음
    navigate(`/accommodations/${accommodation._id}/detail`);
  };

  // 투어/티켓 상세 페이지 이동 함수
  const handleTourTicketClick = ticket => {
    if (!ticket?._id) return;
    navigate(`/tourTicket/list/${ticket._id}`);
  };

  // 여행 용품 상세 페이지 이동 함수
  const handleTravelItemClick = travelItem => {
    if (!travelItem?._id) return;
    navigate(`/travelItems/${travelItem._id}`);
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await getBookingDetails(bookingId);
        console.log('📌 API 응답 데이터:', response);

        // ✅ `response` 자체를 저장해야 함! (data.data가 아님)
        setBooking(response);
      } catch (err) {
        setError('예약 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!booking || Object.keys(booking).length === 0) {
    return <div>예약 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mt-3">
      <h2>예약 상세 정보</h2>
      <p>
        <strong>예약 번호:</strong> {booking.merchant_uid || '정보 없음'}
      </p>
      <p>
        <strong>상품 유형:</strong>{' '}
        {booking.types && booking.types.length > 0
          ? booking.types.map(type => translateType(type)).join(', ')
          : '정보 없음'}
      </p>
      <p>
        <strong>결제 상태:</strong>{' '}
        {translatePaymentStatus(booking.paymentStatus) || '정보 없음'}
      </p>
      <p>
        <strong>총 금액:</strong> ₩{booking.totalPrice?.toLocaleString() || 0}
      </p>
      <p>
        <strong>할인 금액:</strong> ₩{booking.discountAmount?.toLocaleString() || 0}
      </p>
      <p>
        <strong>최종 결제 금액:</strong> ₩{booking.finalPrice?.toLocaleString() || 0}
      </p>

      {/* ✅ 숙소 정보 (Accommodation) - roomIds + productIds 포함 */}
      {booking.types?.includes('accommodation') && (
        <>
          <h4>숙소 정보</h4>
          {/* roomIds에서 가져온 숙소 정보 */}
          {booking.productIds?.length > 0 &&
            booking.productIds
              .filter(product => booking.types.includes('accommodation'))
              .map((product, index) => (
                <div
                  key={product._id}
                  className="card p-2 mb-2"
                  style={{cursor: 'pointer'}} // ✅ 마우스 올리면 클릭 가능 효과
                  onClick={() => handleAccommodationClick(product)} // ✅ 클릭하면 상세 페이지 이동
                >
                  <p>
                    <strong>숙소 상품명:</strong> {product.name || '정보 없음'}
                  </p>
                </div>
              ))}

          {booking.roomIds?.length > 0 &&
            booking.roomIds.map(room => (
              <div key={room._id} className="card p-2 mb-2">
                <p>
                  <strong>객실명:</strong> {room.name}
                </p>
                <p>
                  <strong>가격:</strong> ₩{room.pricePerNight?.toLocaleString()} / 박
                </p>
              </div>
            ))}
          {/* productIds에서 가져온 숙소 상품 정보 */}
        </>
      )}

      {/* ✅ 투어/티켓 정보 (Tour Ticket) */}
      {booking.types?.includes('tourTicket') && booking.productIds?.length > 0 && (
        <>
          <h4>투어/티켓 정보</h4>
          {booking.productIds.map((product, index) => (
            <div
              key={product._id}
              className="card p-2 mb-2"
              style={{cursor: 'pointer'}}
              onClick={() => handleTourTicketClick(product)}>
              <p>
                <strong>상품명:</strong> {product.name || '정보 없음'}
              </p>
              <p>
                <strong>가격:</strong> ₩{product.price?.toLocaleString() || '정보 없음'}
              </p>
              <p>
                <strong>구매 수량:</strong> {booking.counts?.[index] || '정보 없음'}
              </p>
            </div>
          ))}
        </>
      )}

      {/* ✅ 여행 용품 정보 (Travel Item) */}
      {booking.types?.includes('travelItem') && booking.productIds?.length > 0 && (
        <>
          <h4>여행 용품 정보</h4>
          {booking.productIds.map((product, index) => (
            <div
              key={product._id}
              className="card p-2 mb-2"
              style={{cursor: 'pointer'}}
              onClick={() => handleTravelItemClick(product)}>
              <p>
                <strong>상품명:</strong> {product.name || '정보 없음'}
              </p>
              <p>
                <strong>가격:</strong> ₩{product.price?.toLocaleString() || '정보 없음'}
              </p>
              <p>
                <strong>구매 수량:</strong> {booking.counts?.[index] || '정보 없음'}
              </p>
            </div>
          ))}
        </>
      )}

      {/* 예약자 정보 */}
      {booking.reservationInfo ? (
        <>
          <h4>예약자 정보</h4>
          <p>
            <strong>이름:</strong> {booking.reservationInfo.name || '정보 없음'}
          </p>
          <p>
            <strong>이메일:</strong> {booking.reservationInfo.email || '정보 없음'}
          </p>
          <p>
            <strong>연락처:</strong> {booking.reservationInfo.phone || '정보 없음'}
          </p>
        </>
      ) : (
        <p>예약자 정보 없음</p>
      )}
    </div>
  );
};

export default BookingDetail;
