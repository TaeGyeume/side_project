// 메인 페이지 또는 루트 경로와 관련된 라우트 관리

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Express Server!'); // 웹 페이지에서 서버 접속 성공 시, 출력됨
});

router.get('/test', (req, res) => {
  res.json({message: 'This is a test response from the server!'});
});

module.exports = router;
