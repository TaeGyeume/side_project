const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteMultipleTickets
} = require('../../controllers/tourTicketController');
const upload = require('../../middleware/uploadMiddleware');
const authMiddleware = require('../../middleware/authMiddleware'); // ✅ JWT 인증 미들웨어 추가
const authorizeRoles = require('../../middleware/authorizeRoles'); // ✅ 역할 기반 접근 제어 추가

// ✅ [일반 사용자] 모든 투어 티켓 조회 (로그인한 사용자만 접근 가능)
router.get('/list', authMiddleware, getAllTickets);

// ✅ [일반 사용자] 특정 투어 티켓 상세 조회 (로그인한 사용자만 접근 가능)
router.get('/list/:id', authMiddleware, getTicketById);

// ✅ [관리자 전용] 새 투어 티켓 생성
router.post('/new', authMiddleware, authorizeRoles('admin'), upload, createTicket);

// ✅ [관리자 전용] 기존 투어 티켓 수정
router.put('/modify/:id', authMiddleware, authorizeRoles('admin'), upload, updateTicket);

// ✅ [관리자 전용] 투어 티켓 삭제
router.post('/remove', authMiddleware, authorizeRoles('admin'), deleteMultipleTickets);

module.exports = router;
