import React from 'react';

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

const BookingDetail = ({booking}) => {
  return (
    <div className="container mt-3">
      <h2>예약 상세 정보</h2>
      <p>
        <strong>예약 ID:</strong> {booking._id || '정보 없음'}
      </p>
      <p>
        <strong>상품 유형:</strong>{' '}
        {booking.types
          ? booking.types.map(type => translateType(type)).join(', ')
          : '정보 없음'}
      </p>
      <p>
        <strong>결제 상태:</strong> {booking.paymentStatus || '정보 없음'}
      </p>
      <p>
        <strong>총 금액:</strong> ₩
        {booking.totalPrice ? booking.totalPrice.toLocaleString() : 0}
      </p>
      <p>
        <strong>할인 금액:</strong> ₩
        {booking.discountAmount ? booking.discountAmount.toLocaleString() : 0}
      </p>
      <p>
        <strong>최종 결제 금액:</strong> ₩
        {booking.finalPrice ? booking.finalPrice.toLocaleString() : 0}
      </p>

      {/* ✅ 숙소 타입일 경우 객실 정보 출력 */}
      {booking.types.includes('accommodation') &&
      booking.roomIds &&
      booking.roomIds.length > 0 ? (
        <>
          <h4>객실 정보</h4>
          {booking.roomIds.map(room => (
            <div key={room._id} className="card p-2 mb-2">
              <p>
                <strong>객실명:</strong> {room.name}
              </p>
              <p>
                <strong>가격:</strong> ₩{room.pricePerNight.toLocaleString()} / 박
              </p>
            </div>
          ))}
        </>
      ) : (
        <p>객실 정보 없음</p>
      )}

      {/* ✅ 상품 유형별 productIds 출력 */}
      {booking.types.includes('tourTicket') && booking.productIds.length > 0 && (
        <>
          <h4>투어/티켓 정보</h4>
          {booking.productIds.map(product => (
            <div key={product._id} className="card p-2 mb-2">
              <p>
                <strong>상품명:</strong> {product.name || '정보 없음'}
              </p>
              <p>
                <strong>티켓 가격:</strong> ₩
                {product.price ? product.price.toLocaleString() : '정보 없음'}
              </p>
            </div>
          ))}
        </>
      )}

      {booking.types.includes('travelItem') && booking.productIds.length > 0 && (
        <>
          <h4>여행 용품 정보</h4>
          {booking.productIds.map(product => (
            <div key={product._id} className="card p-2 mb-2">
              <p>
                <strong>상품명:</strong> {product.name || '정보 없음'}
              </p>
              <p>
                <strong>가격:</strong> ₩
                {product.price ? product.price.toLocaleString() : '정보 없음'}
              </p>
              <p>
                <strong>구매 수량:</strong>{' '}
                {booking.counts[booking.productIds.indexOf(product)] || '정보 없음'}
              </p>
            </div>
          ))}
        </>
      )}

      {booking.types.includes('flight') && booking.productIds.length > 0 && (
        <>
          <h4>항공권 정보</h4>
          {booking.productIds.map(product => (
            <div key={product._id} className="card p-2 mb-2">
              <p>
                <strong>항공사:</strong> {product.airline || '정보 없음'}
              </p>
              <p>
                <strong>출발지:</strong> {product.departure || '정보 없음'}
              </p>
              <p>
                <strong>도착지:</strong> {product.arrival || '정보 없음'}
              </p>
              <p>
                <strong>가격:</strong> ₩
                {product.price ? product.price.toLocaleString() : '정보 없음'}
              </p>
            </div>
          ))}
        </>
      )}

      {/* ✅ 예약자 정보 출력 */}
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
