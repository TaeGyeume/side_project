const express = require('express');
const router = express.Router();
const qnaController = require('../controllers/qnaController');
const authMiddleware = require('../middleware/authMiddleware'); // JWT 인증 미들웨어
const multer = require('multer');

// ✅ Multer 설정 (파일 업로드 처리)
const upload = multer({dest: 'uploads/'});

// ✅ QnA 게시글 작성 (로그인 필요, 파일 업로드 가능)
router.post(
  '/',
  authMiddleware,
  upload.fields([
    {name: 'images', maxCount: 3}, // 이미지 최대 3개 업로드
    {name: 'attachments', maxCount: 5} // 첨부파일 최대 5개 업로드
  ]),
  qnaController.createQnaBoard
);

// ✅ QnA 게시글 목록 조회 (페이징 & 카테고리 필터 가능)
router.get('/', qnaController.getQnaBoards);

// ✅ 특정 QnA 게시글 조회 (상세보기)
router.get('/:qnaBoardId', qnaController.getQnaBoardById);

// ✅ QnA 게시글 삭제 (작성자 또는 관리자만 가능)
router.delete('/:qnaBoardId', authMiddleware, qnaController.deleteQnaBoard);

// ✅ QnA 댓글 작성 (로그인 필요)
router.post('/:qnaBoardId/comments', authMiddleware, qnaController.createQnaComment);

// ✅ QnA 댓글 목록 조회 (페이징 적용)
router.get('/:qnaBoardId/comments', qnaController.getQnaComments);

// ✅ QnA 댓글 삭제 (작성자 또는 관리자만 가능)
router.delete('/comments/:commentId', authMiddleware, qnaController.deleteQnaComment);

// ✅ QnA 게시글 수정 (작성자만 수정 가능)
router.put('/:qnaBoardId', authMiddleware, qnaController.updateQnaBoard);

module.exports = router;
