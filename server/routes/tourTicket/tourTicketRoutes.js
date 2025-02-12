const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const authorizeRoles = require('../../middleware/authorizeRoles');
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteMultipleTickets
} = require('../../controllers/tourTicketController');
const upload = require('../../middleware/uploadMiddleware');

// 모든 투어.티켓 조회
router.get('/list', getAllTickets);

// 특정 투어.티켓 상세 조회
router.get('/list/:id', getTicketById);

// [관리자만 접근] 새 투어.티켓 생성
router.post('/new', upload, createTicket);

// [관리자만 접근] 기존 투어.티켓 수정
router.put('/modify/:id', upload, updateTicket);

// [관리자만 접근] 투어.티켓 삭제
router.post('/remove', deleteMultipleTickets);

module.exports = router;
