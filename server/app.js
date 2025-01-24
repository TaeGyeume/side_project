const express = require('express');
const cookieOptions = require("./config/cookieConfig");  // 쿠키 설정 불러오기
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');
require("dotenv").config();

const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');

const app = express();

// DB 연결
connectDB();

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,  // 쿠키를 포함한 요청 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],  // 'Cache-Control' 추가
  exposedHeaders: ['set-cookie'],  // 쿠키 삭제를 위한 헤더 설정
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());  // JSON 파싱 (CORS보다 먼저 설정)
app.use(cookieParser());  // 쿠키 파싱
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/', routes);
app.use('/api', routes);
app.use("/api/auth", authRoutes);

// 리프레시 토큰 엔드포인트
app.post("/api/auth/refresh-token", (req, res) => {
  const newToken = "new_refresh_token"; // 실제 토큰 생성 로직 필요

  // 공통 쿠키 설정 적용
  res.cookie('refreshToken', newToken, cookieOptions);

  res.status(200).json({ message: "토큰 갱신 성공" });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('서버 오류가 발생했습니다.');
});

module.exports = app;
