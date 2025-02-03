require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const axios = require('axios');
const moment = require('moment-timezone');
const Flight = require('../models/Flight');

const { DB_URI, SERVICE_KEY } = process.env;

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

const AIRLINE_LOGOS = {
  "이스타항공": "https://yourcdn.com/logos/eastarjet.png",
  "대한항공": "https://yourcdn.com/logos/korean.png",
  "아시아나항공": "https://yourcdn.com/logos/asiana.png",
  "제주항공": "https://yourcdn.com/logos/jeju.png",
  "진에어": "https://yourcdn.com/logos/jinair.png",
  "에어부산": "https://yourcdn.com/logos/airbusan.png"
};

const SELECTED_AIRPORT_CODES = Object.keys(AIRPORT_NAMES);

// ✅ 날짜 변환 함수
const formatDateTime = (dateString, timeString) => {
  if (!dateString || !timeString || typeof timeString !== 'string') return null;

  const datePart = dateString.split('T')[0];
  if (!/^\d{4}$/.test(timeString)) return moment.tz(`${datePart} 00:00`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toDate();

  return moment.tz(`${datePart} ${timeString.slice(0, 2)}:${timeString.slice(2, 4)}`, 'YYYY-MM-DD HH:mm', 'Asia/Seoul').toDate();
};

// ✅ 비행 시간 계산 함수
const calculateDuration = (departureTime, arrivalTime) => {
  const diffMs = Math.abs(new Date(arrivalTime) - new Date(departureTime));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}시간 ${minutes}분`;
};

// ✅ 항공 데이터 수집
const fetchAllFlights = async () => {
  console.log("🚀 항공편 데이터 수집 시작...");

  const today = new Date();
  const futureDate = new Date();
  futureDate.setMonth(today.getMonth() + 1); // 1개월 데이터 수집

  try {
    let currentDate = new Date(today);
    while (currentDate <= futureDate) {
      const formattedDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
      console.log(`📆 현재 처리 중인 날짜: ${formattedDate}`);

      for (const deptCode of SELECTED_AIRPORT_CODES) {
        for (const arrCode of SELECTED_AIRPORT_CODES) {
          if (deptCode === arrCode) continue;

          const url = `http://openapi.airport.co.kr/service/rest/FlightScheduleList/getDflightScheduleList?serviceKey=${encodeURIComponent(SERVICE_KEY)}&schDate=${formattedDate}&schDeptCityCode=${deptCode}&schArrvCityCode=${arrCode}`;

          try {
            const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Expect': '' }, timeout: 10000 });
            const items = response.data?.response?.body?.items?.item;

            if (!items) {
              console.warn(`⚠️ API 응답에는 데이터가 없습니다. (${deptCode} → ${arrCode})`);
              continue;
            }

            for (const flight of Array.isArray(items) ? items : [items]) {
              const flightNumber = flight.domesticFlightNumber || `FL-${Math.random().toString(36).substr(2, 5)}`;
              const departureTime = formatDateTime(flight.domesticStdate, flight.domesticStartTime);
              const arrivalTime = formatDateTime(flight.domesticEddate, flight.domesticArrivalTime);

              if (!departureTime || !arrivalTime) continue;

              const airline = flight.airlineEnglish || flight.airlineKorean || "Unknown Airline";
              const airlineLogo = AIRLINE_LOGOS[airline] || "https://yourcdn.com/logos/default.png";
              const flightDuration = calculateDuration(departureTime, arrivalTime);
              const seatClass = "할인석";
              const isDiscounted = Math.random() < 0.5; // 50% 확률로 할인 적용
              const price = Math.floor(Math.random() * (200000 - 50000) + 50000); // 50,000원 ~ 200,000원
              const seatsAvailable = Math.floor(Math.random() * 10) + 1; // 1~10석

              await Flight.updateOne(
                { flightNumber, "departure.time": departureTime },
                {
                  airline,
                  airlineLogo,
                  flightNumber,
                  departure: { airport: deptCode, city: AIRPORT_NAMES[deptCode], time: departureTime },
                  arrival: { airport: arrCode, city: AIRPORT_NAMES[arrCode], time: arrivalTime },
                  flightDuration,
                  seatClass,
                  isDiscounted,
                  price,
                  seatsAvailable
                },
                { upsert: true }
              );

              console.log(`✅ DB 저장 완료 (${deptCode} → ${arrCode}): FlightNumber=${flightNumber}`);
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
