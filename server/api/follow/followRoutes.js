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

// 요청 중인 팔로우 목록 조회
router.get("/pending/:userId", verifyToken, followController.getPendingRequests);

// 알림 조회
router.get("/incoming/:userId", verifyToken, followController.getIncomingFollowRequests);

// 팔로워 목록 가져오기
router.get("/followers/:userId", verifyToken, followController.getFollowers);

// 팔로잉 목록 가져오기
router.get("/followings/:userId", verifyToken, followController.getFollowings);

router.delete("/delete/:followId", verifyToken, followController.deleteFollow);

// 전체 사용자와 팔로우 상태 조회
router.get("/usersWithStatus/:userId", verifyToken, followController.getAllUsersWithFollowStatus);

module.exports = router;