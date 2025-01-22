// 서버 실행 파일

require('dotenv').config();
const app = require('./app'); // Express 설정 가져옴, 실행은 여기서

const PORT = process.env.SER_PORT || 5000;

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
