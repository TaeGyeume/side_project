const express = require('express');
const cookieOptions = require('./config/cookieConfig'); // 쿠키 설정 불러오기
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');
const passport = require('passport'); // Passport 불러오기
require('./config/passport'); // Passport 설정 파일 불러오기
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const roomRoutes = require('./routes/roomRoutes');
const productRoutes = require('./routes/productRoutes');
const flightRoutes = require('./routes/flightRoutes'); // ✈️ 항공편 라우트 추가
const reservationRoutes = require('./routes/reservationRoutes'); // 🎫 예약 라우트 추가
const socialAuthRoutes = require('./routes/socialAuthRoutes'); // 소셜 로그인 라우트 추가
const userTourTicketRoutes = require('./routes/tourTicket/userTourTicketRoutes');

const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// DB 연결
connectDB();

const corsOptions = {
  origin: `http://localhost:${process.env.CLIENT_PORT || 3000}`,
  credentials: true, // 쿠키를 포함한 요청 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['set-cookie']
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize()); // Passport 초기화 추가

// 라우트 설정
app.use('/', routes);
app.use('/api/locations', locationRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialAuthRoutes); // 소셜 로그인 라우트 추가
app.use('/api/flights', flightRoutes); // ✈️ 항공편 관련 API
app.use('/api/reservations', reservationRoutes); // 🎫 예약 관련 API
app.use('/product', productRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/tourTicket', userTourTicketRoutes);

// 리프레시 토큰 엔드포인트
// app.post('/api/auth/refresh-token', (req, res) => {
//   const newToken = 'new_refresh_token'; // 실제 토큰 생성 로직 필요

//   res.cookie('refreshToken', newToken, {
//     ...cookieOptions,
//     httpOnly: true,
//     secure: false // 로컬 환경에서는 false 설정 유지
//   });

//   res.status(200).json({ message: '토큰 갱신 성공' });
// });

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('서버 오류가 발생했습니다.');
});

module.exports = app;
