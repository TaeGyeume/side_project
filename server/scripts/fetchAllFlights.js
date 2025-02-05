require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});

const mongoose = require('mongoose');
const axios = require('axios');
const moment = require('moment-timezone');
const Flight = require('../models/Flight');

const {DB_URI, SERVICE_KEY} = process.env;

if (!DB_URI || !SERVICE_KEY) {
  console.error('❌ 환경 변수(DB_URI 또는 SERVICE_KEY)가 설정되지 않았습니다.');
  process.exit(1);
}

// ✅ MongoDB 연결
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000
  })
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

const AIRPORT_NAMES = {
  GMP: '김포공항',
  ICN: '인천공항',
  PUS: '김해공항',
  CJU: '제주공항',
  TAE: '대구공항',
  KWJ: '광주공항',
  CJJ: '청주공항',
  RSU: '여수공항',
  MWX: '무안공항'
};

// ✅ 필터링할 항공사 (대한항공, 아시아나항공)
const ALLOWED_AIRLINES = ['KOREAN AIR', 'ASIANA AIRLINE'];

// ✅ API 응답 요일 필드를 운항 요일 배열로 변환하는 함수
const getOperatingDays = flight => {
  const days = [];
  if (flight.domesticSun === 'Y') days.push('일요일');
  if (flight.domesticMon === 'Y') days.push('월요일');
  if (flight.domesticTue === 'Y') days.push('화요일');
  if (flight.domesticWed === 'Y') days.push('수요일');
  if (flight.domesticThu === 'Y') days.push('목요일');
  if (flight.domesticFri === 'Y') days.push('금요일');
  if (flight.domesticSat === 'Y') days.push('토요일');
  return days;
};

const formatDateTime = (dateString, timeString) => {
  if (!dateString || !timeString || typeof timeString !== 'string') return null;

  const datePart = dateString.split('T')[0];
  if (!/^\d{4}$/.test(timeString))
    return moment.tz(`${datePart} 00:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toDate();

  return moment
    .tz(
      `${datePart} ${timeString.slice(0, 2)}:${timeString.slice(2, 4)}`,
      'YYYY-MM-DD HH:mm',
      'Asia/Seoul'
    )
    .toDate();
};

const fetchAllFlights = async () => {
  console.log('🚀 항공편 데이터 수집 시작...');

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 7); // ✅ 1주일 후까지만 데이터 저장

  try {
    let currentDate = new Date(today);
    while (currentDate <= futureDate) {
      const formattedDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
      console.log(`📆 현재 처리 중인 날짜: ${formattedDate}`);

      for (const deptCode of Object.keys(AIRPORT_NAMES)) {
        for (const arrCode of Object.keys(AIRPORT_NAMES)) {
          if (deptCode === arrCode) continue;

          const url = `http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList?serviceKey=${encodeURIComponent(
            SERVICE_KEY
          )}&schDate=${formattedDate}&schDeptCityCode=${deptCode}&schArrvCityCode=${arrCode}`;

          try {
            const response = await axios.get(url, {
              headers: {'User-Agent': 'Mozilla/5.0'},
              timeout: 10000
            });
            const items = response.data?.response?.body?.items?.item;

            if (!items) continue;

            const flights = Array.isArray(items) ? items : [items];

            for (const flight of flights) {
              const airline =
                flight.airlineEnglish || flight.airlineKorean || 'Unknown Airline';
              if (!ALLOWED_AIRLINES.includes(airline)) continue;

              const flightNumber =
                flight.domesticFlightNumber ||
                `FL-${Math.random().toString(36).substr(2, 5)}`;
              const departureTime = formatDateTime(
                flight.domesticStdate,
                flight.domesticStartTime
              );
              const arrivalTime = formatDateTime(
                flight.domesticEddate,
                flight.domesticArrivalTime
              );

              if (!departureTime || !arrivalTime) continue;

              // ✅ 운항 요일 저장
              const operatingDays = getOperatingDays(flight);

              // ✅ 가격 조정 (3만 원 이하, 3만 원 이상 10만 원 미만, 10만 원 이상)
              let price;
              const random = Math.random();
              if (random < 0.2) {
                price = Math.floor(Math.random() * (30000 - 10000) + 10000); // ✅ 특가석 (10,000 ~ 30,000)
              } else if (random < 0.8) {
                price = Math.floor(Math.random() * (100000 - 30000) + 30000); // ✅ 일반석 (30,000 ~ 100,000)
              } else {
                price = Math.floor(Math.random() * (200000 - 100000) + 100000); // ✅ 비즈니스석 (100,000 ~ 200,000)
              }

              // ✅ 좌석 등급 설정
              let seatClass;
              if (price < 30000) {
                seatClass = '특가석';
              } else if (price < 100000) {
                seatClass = '일반석';
              } else {
                seatClass = '비즈니스석';
              }

              await Flight.updateOne(
                { flightNumber, 'departure.time': departureTime },
                {
                  airline,
                  flightNumber,
                  departure: {
                    airport: deptCode,
                    city: AIRPORT_NAMES[deptCode],
                    time: departureTime
                  },
                  arrival: {
                    airport: arrCode,
                    city: AIRPORT_NAMES[arrCode],
                    time: arrivalTime
                  },
                  operatingDays,
                  price,
                  seatsAvailable: Math.floor(Math.random() * 10) + 1, // ✅ 좌석 정보 필드 추가
                  seatClass // ✅ 좌석 등급 필드 추가
                },
                { upsert: true }
              );

              console.log(
                `✅ 저장 완료: ${flightNumber} (${airline}), 운항 요일: ${operatingDays.join(
                  ', '
                )}, 가격: ${price.toLocaleString()}원, 좌석 등급: ${seatClass}`
              );
            }
          } catch (error) {
            console.error(`❌ API 요청 오류 (${deptCode} → ${arrCode}):`, error.message);
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  } finally {
    mongoose.connection.close();
  }
};

fetchAllFlights();
