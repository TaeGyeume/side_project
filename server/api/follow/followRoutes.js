const express = require("express");
const followController = require("./followController");
const { verifyToken } = require("../../middleware/auth"); // verifyToken 미들웨어 임포트

const router = express.Router();

// 팔로우 요청 생성
router.post("/create", verifyToken, followController.createFollow);

// 팔로우 요청 수락
router.put("/accept/:followId", verifyToken, followController.acceptFollow);

// 팔로우 요청 거절
router.put("/reject/:followId", verifyToken, followController.rejectFollow);

// 팔로워 목록 조회
router.get("/followers/:userId", verifyToken, followController.getFollowers);

// 팔로잉 목록 조회
router.get("/following/:userId", verifyToken, followController.getFollowing);

// 요청 중인 팔로우 목록 조회
router.get("/pending/:userId", verifyToken, followController.getPendingRequests);

module.exports = router;