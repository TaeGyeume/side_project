// 서버 실행 파일

const app = require('./app');
const dotenv = require('dotenv');

// 환경 변수 로드
dotenv.config();

const PORT = process.env.PORT || 5000;

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
