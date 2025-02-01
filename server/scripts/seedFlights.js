const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Flight = require('../models/Flight');

// ✅ 환경 변수 로드
dotenv.config();

// ✅ DB 연결 문자열 확인 (콘솔 로그 추가)
console.log('MongoDB 연결 URI:', process.env.DB_URI);

// ✅ MongoDB 연결
mongoose
  .connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// ✅ 샘플 항공편 데이터
const sampleFlights = [
  {
    airline: '대한항공',
    flightNumber: 'KE123',
    departure: {
      airport: '인천국제공항',
      city: 'ICN',
      time: new Date('2024-06-10T10:00:00Z')
    },
    arrival: {
      airport: '로스앤젤레스 국제공항',
      city: 'LAX',
      time: new Date('2024-06-10T18:00:00Z')
    },
    price: 950000,
    seatsAvailable: 150
  },
  {
    airline: '아시아나항공',
    flightNumber: 'OZ456',
    departure: {
      airport: '김포국제공항',
      city: 'GMP',
      time: new Date('2024-06-12T09:30:00Z')
    },
    arrival: {
      airport: '도쿄 나리타 공항',
      city: 'NRT',
      time: new Date('2024-06-12T12:45:00Z')
    },
    price: 500000,
    seatsAvailable: 120
  },
  {
    airline: '에미레이트 항공',
    flightNumber: 'EK789',
    departure: {
      airport: '인천국제공항',
      city: 'ICN',
      time: new Date('2024-06-15T22:00:00Z')
    },
    arrival: {
      airport: '두바이 국제공항',
      city: 'DXB',
      time: new Date('2024-06-16T04:30:00Z')
    },
    price: 1200000,
    seatsAvailable: 180
  },
  {
    airline: '싱가포르 항공',
    flightNumber: 'SQ456',
    departure: {
      airport: '싱가포르 창이 공항',
      city: 'SIN',
      time: new Date('2024-06-17T14:30:00Z')
    },
    arrival: {
      airport: '도쿄 나리타 공항',
      city: 'NRT',
      time: new Date('2024-06-17T22:00:00Z')
    },
    price: 700000,
    seatsAvailable: 160
  },
  {
    airline: '루프트한자',
    flightNumber: 'LH789',
    departure: {
      airport: '프랑크푸르트 국제공항',
      city: 'FRA',
      time: new Date('2024-06-20T09:00:00Z')
    },
    arrival: {
      airport: '로스앤젤레스 국제공항',
      city: 'LAX',
      time: new Date('2024-06-20T17:00:00Z')
    },
    price: 1400000,
    seatsAvailable: 170
  },
  {
    airline: '터키항공',
    flightNumber: 'TK567',
    departure: {
      airport: '이스탄불 공항',
      city: 'IST',
      time: new Date('2024-06-22T21:45:00Z')
    },
    arrival: {
      airport: '런던 히드로 공항',
      city: 'LHR',
      time: new Date('2024-06-23T02:30:00Z')
    },
    price: 850000,
    seatsAvailable: 190
  },
  {
    airline: '카타르항공',
    flightNumber: 'QR678',
    departure: {
      airport: '도하 하마드 국제공항',
      city: 'DOH',
      time: new Date('2024-06-25T06:00:00Z')
    },
    arrival: {
      airport: '방콕 수완나품 공항',
      city: 'BKK',
      time: new Date('2024-06-25T12:00:00Z')
    },
    price: 600000,
    seatsAvailable: 210
  },
  {
    airline: '델타항공',
    flightNumber: 'DL789',
    departure: {
      airport: '애틀랜타 하츠필드 공항',
      city: 'ATL',
      time: new Date('2024-06-28T16:00:00Z')
    },
    arrival: {
      airport: '파리 샤를드골 공항',
      city: 'CDG',
      time: new Date('2024-06-29T06:30:00Z')
    },
    price: 1250000,
    seatsAvailable: 180
  },
  {
    airline: 'ANA 항공',
    flightNumber: 'NH888',
    departure: {
      airport: '도쿄 하네다 공항',
      city: 'HND',
      time: new Date('2024-07-01T20:30:00Z')
    },
    arrival: {
      airport: '시드니 국제공항',
      city: 'SYD',
      time: new Date('2024-07-02T06:45:00Z')
    },
    price: 1500000,
    seatsAvailable: 175
  },
  {
    airline: '브리티시 항공',
    flightNumber: 'BA999',
    departure: {
      airport: '런던 히드로 공항',
      city: 'LHR',
      time: new Date('2024-07-03T07:00:00Z')
    },
    arrival: {
      airport: '뉴욕 JFK 공항',
      city: 'JFK',
      time: new Date('2024-07-03T10:45:00Z')
    },
    price: 1100000,
    seatsAvailable: 190
  }
];

// ✅ 데이터 삽입 함수
const insertSampleFlights = async () => {
  try {
    await Flight.deleteMany(); // 기존 데이터 삭제
    await Flight.insertMany(sampleFlights);
    console.log('샘플 항공편 데이터 삽입 완료!');
    process.exit();
  } catch (error) {
    console.error('샘플 데이터 삽입 실패:', error);
    process.exit(1);
  }
};

// ✅ 실행
insertSampleFlights();
