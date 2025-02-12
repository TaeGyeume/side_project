import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import OneWayBooking from '../../components/flights/OneWayBooking';
import RoundTripBooking from '../../components/flights/RoundTripBooking';

// ✅ 요금 계산 함수
const calculateTotalPrice = (
  selectedDeparture,
  selectedReturn,
  selectedFlight,
  passengers
) => {
  const basePrice = selectedFlight?.price || selectedDeparture?.price || 0;
  const returnPrice = selectedReturn?.price || 0;

  return (basePrice + returnPrice) * Math.max(1, passengers);
};

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedDeparture,
    selectedReturn,
    passengers = 1,
    isRoundTrip,
    selectedFlight
  } = location.state || {};

  if (!selectedDeparture && !selectedFlight) {
    return <div className="text-center mt-5">🚫 선택된 항공편이 없습니다.</div>;
  }

  // ✅ 총 금액 & 할인 적용
  const basePrice = calculateTotalPrice(
    selectedDeparture,
    selectedReturn,
    selectedFlight,
    passengers
  );
  const discount = 0; // 발권 수수료 할인
  const totalPrice = Math.max(0, basePrice - discount);
  const rewardPoints = Math.max(0, Math.floor(totalPrice * 0.003)); // 포인트 적립 (0.3%)

  return (
    <div className="container mt-5" style={{maxWidth: '1100px'}}>
      <h2 className="fw-bold mb-4 text-center text-dark">✈️ 항공권 예약</h2>

      <div className="row">
        {/* ✅ 좌측: 항공편 정보 */}
        <div className="col-md-8">
          {isRoundTrip ? (
            <RoundTripBooking
              selectedDeparture={selectedDeparture}
              selectedReturn={selectedReturn}
            />
          ) : selectedFlight ? (
            <OneWayBooking flight={selectedFlight} />
          ) : (
            <OneWayBooking flight={selectedDeparture} />
          )}
        </div>

        {/* ✅ 우측: 요금 정보 */}
        <div className="col-md-4">
          <div
            className="card shadow-lg p-4"
            style={{borderRadius: '12px', background: '#ffffff'}}>
            <h5 className="fw-bold">💰 요금 정보</h5>

            {/* ✅ 예상 금액 (취소선 포함) */}
            <div className="d-flex justify-content-between">
              <span className="text-muted">예상금액</span>
              <span className="text-muted text-decoration-line-through fs-5">
                {basePrice.toLocaleString()}원
              </span>
            </div>

            {/* ✅ 발권 수수료 할인 */}
            <div className="d-flex justify-content-between">
              <span className="text-danger fw-bold">발권수수료 할인</span>
              <span className="text-danger fw-bold">- {discount.toLocaleString()}원</span>
            </div>

            <hr />

            {/* ✅ 최종 총 금액 */}
            <div className="d-flex justify-content-between fw-bold">
              <span>총 {passengers}명</span>
              <span className="fs-4 text-dark">{totalPrice.toLocaleString()}원</span>
            </div>

            {/* ✅ 포인트 적립 */}
            <div
              className="p-3 mt-3"
              style={{background: '#eef2f7', borderRadius: '10px'}}>
              <p className="text-muted mb-1">포인트 적립</p>
              <span className="text-primary fw-bold">
                {rewardPoints.toLocaleString()}원 적립 예정
              </span>
            </div>

            {/* ✅ 환불 정책 */}
            <p className="text-center text-success mt-2">✔ 오늘 23:49까지 100% 환불</p>

            {/* ✅ 예약 버튼 */}
            <button
              className="btn btn-primary btn-lg w-100 fw-bold mt-3"
              style={{borderRadius: '10px'}}
              onClick={() => alert('예약이 완료되었습니다!')}>
              항공권 예약하기 🛫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
