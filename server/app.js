// Express 프레임워크 설정

const express = require('express');

// 악의적인 사용자가 .put, .delete 등
// 이런 메소드를 통해 URI에서 서버로
// 데이터 전송하는 것을 막기 위해서 사용
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();

// DB 연결
connectDB();

// 미들웨어 설정
const corsOptions = {
  origin: `http://localhost:${process.env.CLI_PORT || 3000}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // 쿠키를 포함한 요청 허용
};

app.use(cors(corsOptions));

app.use(express.json());

// 라우트 설정
app.use('/', routes); // 기본 서버 엔드포인트

// 테스트 엔드포인트
app.use('/api', routes);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;
