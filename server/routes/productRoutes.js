// 항공, 숙소, 투어.티켓, 여행용품 상품 페이지 라우트 설정

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: '이동할 상품 페이지 선택',
    categories: ['air', 'accommodation', 'tourTicket', 'travel-goods']
  });
});

router.use('/tourTicket', require('./tourTicket/tourTicketRoutes'));

module.exports = router;
