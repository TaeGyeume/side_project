const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/tourTicketController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 관리자 권한 확인 미들웨어
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.roles === 'admin') {
    next(); // 관리자 권한 확인 후 다음 미들웨어 실행
  } else {
    res.status(403).json({message: '관리자 권한이 필요합니다.'});
  }
};

// 모든 투어.티켓 조회
router.get('/list', getAllTickets);

// 특정 투어.티켓 상세 조회
router.get('/:id', getTicketById);

// [관리자만 접근] 새 투어.티켓 생성
router.post('/new', upload, /*authMiddleware, adminMiddleware,*/ createTicket);

// [관리자만 접근] 기존 투어.티켓 수정
router.put('/modify/:id', upload, /*authMiddleware, adminMiddleware,*/ updateTicket);

// [관리자만 접근] 투어.티켓 삭제
router.delete('/remove/:id', /*authMiddleware, adminMiddleware,*/ deleteTicket);

router.get('/', (req, res) => {
  res.json({
    message: '투어.티켓 페이지',
    actions: {
      list: '/product/tourTicket/list',
      new: '/product/tourTicket/new',
      modify: '/product/tourTicket/modify/:id',
      delete: '/product/tourTicket/remove/:id'
    }
  });
});

module.exports = router;
