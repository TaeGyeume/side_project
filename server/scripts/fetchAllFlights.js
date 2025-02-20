require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});

const mongoose = require('mongoose');
const axios = require('axios');
const moment = require('moment-timezone');
const Flight = require('../models/Flight');

const {DB_URI, SERVICE_KEY} = process.env;

if (!DB_URI || !SERVICE_KEY) {
  console.error('환경 변수(DB_URI 또는 SERVICE_KEY)가 설정되지 않았습니다.');
  process.exit(1);
}

// MongoDB 연결
mongoose
  .connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000
  })
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

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

// 필터링할 항공사
const ALLOWED_AIRLINES = [
  '대한항공',
  '아시아나항공',
  '에어서울',
  '이스타항공',
  '진에어',
  '티웨이항공',
  '제주항공'
];

// API 응답 요일 필드를 운항 요일 배열로 변환하는 함수
const getOperatingDays = flight => {
  return [
    flight.domesticSun === 'Y' && '일요일',
    flight.domesticMon === 'Y' && '월요일',
    flight.domesticTue === 'Y' && '화요일',
    flight.domesticWed === 'Y' && '수요일',
    flight.domesticThu === 'Y' && '목요일',
    flight.domesticFri === 'Y' && '금요일',
    flight.domesticSat === 'Y' && '토요일'
  ].filter(Boolean);
};

const fetchAllFlights = async () => {
  console.log('항공편 데이터 수집 시작...');

  const today = moment().tz('Asia/Seoul').startOf('day'); // KST 기준으로 시작
  const futureDate = moment().tz('Asia/Seoul').add(7, 'days').endOf('day'); // KST 기준으로 7일 후

  try {
    let currentDate = moment(today);
    while (currentDate <= futureDate) {
      const formattedDate = currentDate.format('YYYYMMDD'); // YYYYMMDD 형식 유지
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
              const airline = flight.airlineKorean || 'Unknown Airline';
              if (!ALLOWED_AIRLINES.includes(airline)) continue;

              const flightNumber =
                flight.domesticNum || `FL-${Math.random().toString(36).substr(2, 5)}`;

              // KST(한국 시간) 기준으로 변환 후 Date 객체 저장
              let departureDate = moment(`${formattedDate} 00:00`, 'YYYYMMDD HH:mm')
                .utcOffset(540) // KST (UTC+9) 적용
                .toDate(); // Date 객체 저장

              let arrivalDate = moment(`${formattedDate} 00:00`, 'YYYYMMDD HH:mm')
                .utcOffset(540) // KST (UTC+9) 적용
                .toDate(); // Date 객체 저장

              if (!departureDate || !arrivalDate) {
                console.warn(`유효하지 않은 날짜: ${formattedDate}`);
                continue;
              }

              // 출발 & 도착 시간 (HHmm 형식 그대로 유지)
              const departureTime = flight.domesticStartTime || '0000';
              const arrivalTime = flight.domesticArrivalTime || '0000';

              // 운항 요일 저장
              const operatingDays = getOperatingDays(flight);

              // 좌석 정보 및 가격 설정
              const seatsAvailable = Math.floor(Math.random() * 10) + 1;
              let price;
              const random = Math.random();

              if (random < 0.2) {
                price = Math.floor(Math.random() * (30000 - 10000) + 10000); // 1만 원 ~ 3만 원 미만
              } else if (random < 0.8) {
                price = Math.floor(Math.random() * (100000 - 30000) + 30000); // 3만 원 ~ 10만 원 미만
              } else {
                price = Math.floor(Math.random() * (150000 - 100000) + 100000); // 10만 원 ~ 15만 원 미만
              }

              let seatClass;
              if (price < 30000) {
                seatClass = '특가석';
              } else if (price < 100000) {
                seatClass = '일반석';
              } else {
                seatClass = '비즈니스석';
              }

              await Flight.updateOne(
                {flightNumber, 'departure.date': departureDate},
                {
                  airline,
                  flightNumber,
                  departure: {
                    airport: deptCode,
                    city: AIRPORT_NAMES[deptCode],
                    date: departureDate, // KST 변환된 Date 객체 저장
                    time: departureTime
                  },
                  arrival: {
                    airport: arrCode,
                    city: AIRPORT_NAMES[arrCode],
                    date: arrivalDate, // KST 변환된 Date 객체 저장
                    time: arrivalTime
                  },
                  operatingDays,
                  price,
                  seatsAvailable,
                  seatClass
                },
                {upsert: true}
              );

              console.log(
                `저장 완료: ${flightNumber} (${airline}), 날짜: ${moment(departureDate)
                  .tz('Asia/Seoul')
                  .format(
                    'YYYY-MM-DD HH:mm'
                  )}, 좌석: ${seatsAvailable}, 가격: ${price.toLocaleString()}원, 등급: ${seatClass}`
              );
            }
          } catch (error) {
            console.error(`API 요청 오류 (${deptCode} → ${arrCode}):`, error.message);
          }
        }
      }

      currentDate.add(1, 'days'); // 하루씩 증가
    }
  } finally {
    mongoose.connection.close();
  }
};

fetchAllFlights();
