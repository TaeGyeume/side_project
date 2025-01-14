const express = require('express');
const multer = require("multer");
const { createBoard, getBoards, getBoardById } = require('./boardController');

const router = express.Router();

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 게시물 생성
router.post("/", upload.array("media", 10), createBoard);

// 게시물 목록 조회
router.get('/', getBoards);

// 특정 게시물 조회
router.get('/:id', getBoardById);

module.exports = router;