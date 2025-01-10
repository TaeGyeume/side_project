const express = require('express');
const { createBoard, getBoards, getBoardById } = require('../controllers/boardController');

const router = express.Router();

// 게시물 생성
router.post('/', createBoard);

// 게시물 목록 조회
router.get('/', getBoards);

// 특정 게시물 조회
router.get('/:id', getBoardById);

module.exports = router;