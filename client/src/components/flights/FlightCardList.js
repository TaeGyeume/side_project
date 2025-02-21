import React from 'react';
import {useNavigate} from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 공항별 대표 이미지 매핑
const FLIGHT_IMAGES = {
  제주: '/images/flightscard/jeju.jpg',
  부산: '/images/flightscard/busan.jpg',
  대구: '/images/flightscard/daegu.jpg',
  광주: '/images/flightscard/gwangju.jpg',
  청주: '/images/flightscard/cheongju.jpg',
  여수: '/images/flightscard/yeosu.jpg'
};

// IATA 코드 → 한글 도시명 변환
const AIRPORT_NAMES = {
  GMP: '서울', // 김포공항 → 서울
  PUS: '부산', // 김해공항 → 부산
  CJU: '제주', // 제주공항 → 제주
  TAE: '대구', // 대구공항 → 대구
  KWJ: '광주', // 광주공항 → 광주
  CJJ: '청주', // 청주공항 → 청주
  RSU: '여수' // 여수공항 → 여수
};

const FlightCardList = ({flights}) => {
  const navigate = useNavigate();

  const handleCardClick = flight => {
    navigate('/flights/results', {state: {selectedFlight: flight}});
  };

  // 김포공항 출발 & 각 도착 공항별 가장 저렴한 항공편 선택
  const uniqueFlights = [];
  const seenAirports = new Set();

  flights
    .filter(flight => flight.departure.airport === 'GMP') // 김포공항 출발 필터링
    .sort((a, b) => a.price - b.price) // 가격 기준 정렬 (저렴한 것 우선)
    .forEach(flight => {
      if (!seenAirports.has(flight.arrival.airport)) {
        seenAirports.add(flight.arrival.airport);
        uniqueFlights.push(flight);
      }
    });

  // 슬라이더 설정
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4, // 한 번에 보이는 카드 수
    slidesToScroll: 2, // 한 번에 넘어가는 카드 수
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3 text-center">
        🧸 나를 위한 리셋, 마음을 담은 국내 여행 💕 🧳
      </h2>

      {/* 슬라이더를 감싸는 div에 position: relative 추가 */}
      <div className="position-relative">
        <Slider {...settings}>
          {uniqueFlights.map(flight => {
            const departureName = AIRPORT_NAMES[flight.departure.airport] || '출발지';
            const arrivalName = AIRPORT_NAMES[flight.arrival.airport] || '도착지';
            const flightImage =
              FLIGHT_IMAGES[arrivalName] || '/images/flights/default.jpg';

            return (
              <div key={flight._id} className="px-2">
                <div
                  className="card shadow-sm border-0 rounded-lg"
                  onClick={() => handleCardClick(flight)}
                  style={{cursor: 'pointer'}}>
                  <img
                    src={flightImage}
                    className="card-img-top"
                    alt={arrivalName}
                    style={{height: '150px', objectFit: 'cover'}}
                  />
                  <div className="card-body">
                    <h5 className="fw-bold">{arrivalName}</h5>
                    <p className="text-muted">
                      {departureName} → {arrivalName}
                    </p>
                    <p className="text-muted">
                      {new Date(flight.departure.date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric'
                      })}{' '}
                      -{' '}
                      {new Date(flight.arrival.date).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="fw-bold">{flight.price.toLocaleString()}원 ~</p>
                    {/* <button className="text-primary border-0 bg-transparent">편도</button> */}
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

// 커스텀 화살표 (Next)
const NextArrow = ({onClick}) => (
  <div
    className="slick-arrow slick-next"
    onClick={onClick}
    style={{
      position: 'absolute',
      right: '-35px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      fontSize: '24px',
      cursor: 'pointer',
      background: '#fff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
    ➡️
  </div>
);

// 커스텀 화살표 (Prev)
const PrevArrow = ({onClick}) => (
  <div
    className="slick-arrow slick-prev"
    onClick={onClick}
    style={{
      position: 'absolute',
      left: '-35px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
      fontSize: '24px',
      cursor: 'pointer',
      background: '#fff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)'
    }}>
    ⬅️
  </div>
);

export default FlightCardList;
