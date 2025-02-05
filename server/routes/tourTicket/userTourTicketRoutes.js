const express = require('express');
const router = express.Router();
const {getAllTickets, getTicketById} = require('../../controllers/tourTicketController');

// 모든 투어.티켓 조회
router.get('/list', getAllTickets);

// 특정 투어.티켓 상세 조회
router.get('/list/:id', getTicketById);

module.exports = router;
