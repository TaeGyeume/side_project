const express = require('express');
const multer = require("multer");
const { createBoard, getBoards, getBoardById, getUserBoards } = require('./boardController');
const { verifyToken } = require("../../middleware/auth");

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
router.post("/", verifyToken, upload.array("media", 10), createBoard);

// 게시물 목록 조회
router.get('/', verifyToken, getBoards);

// 특정 게시물 조회
router.get('/:id', verifyToken, getBoardById);

// 사용자별 게시물 조회 (로그인한 사용자만)
router.get("/my-boards", verifyToken, getUserBoards);

module.exports = router;
