require("dotenv").config(); // 환경 변수 로드
const app = require("./app"); // Express 앱 가져오기
const connectDB = require("./config/db"); // MongoDB 연결 설정

// MongoDB 연결
connectDB();

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
