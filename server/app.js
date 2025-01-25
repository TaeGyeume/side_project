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
  origin: `http://localhost:${process.env.CLIENT_PORT || 3000}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['set-cookie'],  
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/', routes);
app.use('/api', routes);
app.use("/api/auth", authRoutes);

// 리프레시 토큰 엔드포인트
app.post("/api/auth/refresh-token", (req, res) => {
  const newToken = "new_refresh_token"; // 실제 토큰 생성 로직 필요

  res.cookie('refreshToken', newToken, {
    ...cookieOptions,
    httpOnly: true, 
    secure: false,   // 로컬 환경에서는 false 설정 유지
  });

  res.status(200).json({ message: "토큰 갱신 성공" });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('서버 오류가 발생했습니다.');
});

module.exports = app;
