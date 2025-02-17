import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createBooking, verifyPayment} from '../../api/booking/bookingService';
import {authAPI} from '../../api/auth/index';

const AIRLINE_LOGOS = {
  대한항공: 'korean.png',
  아시아나항공: 'asiana.png',
  에어서울: 'airseoul.png',
  이스타항공: 'eastar.png',
  진에어: 'jinair.png',
  티웨이항공: 'twayair.png',
  제주항공: 'jejuair.png'
};

const RoundTripConfirm = () => {
  const {id} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    selectedDeparture,
    selectedReturn,
    selectedFlight,
    passengers = location.state?.passengers || 1
  } = location.state || {};
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('사용자 정보를 가져오는 중 오류 발생:', error);
      }
    };
    fetchUser();
  }, []);

  if (!selectedDeparture && !selectedReturn && !selectedFlight) {
    return <p className="text-center text-danger">🚫 예약할 항공편이 없습니다.</p>;
  }

  const totalPrice =
    ((selectedDeparture?.price || 0) +
      (selectedReturn?.price || 0) +
      (selectedFlight?.price || 0)) *
    passengers;

  const handleConfirm = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const selectedProducts = [];

    if (selectedFlight?._id) {
      selectedProducts.push({
        type: 'flight',
        productId: selectedFlight._id,
        count: passengers,
        price: selectedFlight.price
      });
    }

    if (selectedDeparture?._id) {
      selectedProducts.push({
        type: 'flight',
        productId: selectedDeparture._id,
        count: passengers,
        price: selectedDeparture.price
      });
    }

    if (selectedReturn?._id) {
      selectedProducts.push({
        type: 'flight',
        productId: selectedReturn._id,
        count: passengers,
        price: selectedReturn.price
      });
    }

    const totalAmount = selectedProducts.reduce(
      (sum, item) => sum + item.count * item.price,
      0
    );

    const now = new Date(Date.now() + 9 * 60 * 60 * 1000); // 한국 시간
    const formattedDate = now
      .toISOString()
      .slice(2, 19) // YYMMDDTHHMMSS
      .replace(/[-T:]/g, ''); // YYMMDDHHMMSS

    const merchant_uid = `${user.username}_${formattedDate}`;

    const bookingData = {
      types: selectedProducts.map(item => item.type),
      productIds: selectedProducts.map(item => item.productId),
      counts: selectedProducts.map(item => passengers),
      totalPrice: totalAmount,
      userId: user._id,
      reservationInfo: {name: user.username, email: user.email, phone: user.phone},
      merchant_uid
    };

    try {
      const bookingResponse = await createBooking(bookingData);
      console.log('✅ 예약 생성 성공:', bookingResponse);

      const {IMP} = window;
      IMP.init('imp22685348');

      IMP.request_pay(
        {
          pg: 'html5_inicis.INIpayTest',
          pay_method: 'card',
          merchant_uid,
          name: '항공권 및 기타 상품 예약',
          amount: totalAmount,
          buyer_email: user.email,
          buyer_name: user.username,
          buyer_tel: user.phone
        },
        async rsp => {
          if (rsp.success) {
            console.log('✅ 결제 성공:', rsp);
            const verifyResponse = await verifyPayment({
              imp_uid: rsp.imp_uid,
              merchant_uid
            });
            console.log('✅ 결제 검증 응답:', verifyResponse);
            if (verifyResponse.message === '결제 검증 성공') {
              alert('항공권 및 기타 상품 예약이 완료되었습니다.');
              navigate('/');
            } else alert(`결제 검증 실패: ${verifyResponse.message}`);
          } else alert(`결제 실패: ${rsp.error_msg}`);
        }
      );
    } catch (error) {
      console.error('❌ 예약 및 결제 중 오류 발생:', error);
      alert('예약 및 결제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container-md mt-4" style={{maxWidth: '900px'}}>
      <h2 className="fw-bold mb-4 text-center">📋 왕복 항공편 예약 확인</h2>
      <div className="text-center mb-4">
        <h4 className="fw-bold">👥 인원수: {passengers}명</h4>
      </div>
      <div className="row justify-content-center">
        {selectedFlight && <FlightCard flight={selectedFlight} />}
        {selectedDeparture && <FlightCard flight={selectedDeparture} />}
        {selectedReturn && <FlightCard flight={selectedReturn} />}
        <div className="col-12 text-center mt-3">
          <h4 className="fw-bold">💰 총 예약 비용: {totalPrice.toLocaleString()}원</h4>
        </div>
        <div className="col-12 text-center mt-3">
          <button className="btn btn-primary px-4 py-2" onClick={handleConfirm}>
            🚀 예약 확정
          </button>
        </div>
      </div>
    </div>
  );
};

const FlightCard = ({flight}) => (
  <div className="col-12 mb-3">
    <div
      className="card p-3 shadow-sm d-flex flex-row align-items-center"
      style={{minHeight: '80px'}}>
      <div className="d-flex align-items-center me-3" style={{flexBasis: '200px'}}>
        <img
          src={`/images/logos/${AIRLINE_LOGOS[flight.airline] || 'default.png'}`}
          alt={flight.airline}
          className="img-fluid"
          style={{width: '40px', height: '40px'}}
        />
        <div className="ms-2">
          <h6 className="mb-1">{flight.airline}</h6>
          <small className="text-muted">{flight.flightNumber}</small>
        </div>
      </div>
      <div className="text-center" style={{flexBasis: '150px'}}>
        <p className="fs-5 fw-bold mb-0">{flight.departure.time}</p>
        <small className="text-muted">{flight.departure.airport}</small>
      </div>
      <div className="fs-5 text-muted mx-2">→</div>
      <div className="text-center" style={{flexBasis: '150px'}}>
        <p className="fs-5 fw-bold mb-0">{flight.arrival.time}</p>
        <small className="text-muted">{flight.arrival.airport}</small>
      </div>
      <div className="text-center" style={{flexBasis: '120px'}}>
        <p className="fw-semibold text-success mb-0">{flight.seatClass || '등급 미정'}</p>
        <small className="text-muted">{flight.seatsAvailable || '정보 없음'}석</small>
      </div>
      <div
        className="text-end ms-auto"
        style={{flexBasis: '130px', whiteSpace: 'nowrap'}}>
        <p className="fs-5 fw-bold text-primary mb-0">
          {flight.price ? flight.price.toLocaleString() : '0'}원
        </p>
        <small className="text-muted">(1인 기준)</small>
      </div>
    </div>
  </div>
);

export default RoundTripConfirm;
