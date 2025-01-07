const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

// 자신의 프로필 조회
router.get("/me", verifyToken, userController.getMyInfo);

// 사용자 프로필 이미지 업로드
router.post("/me/profile-image", verifyToken, userController.uploadProfileImage);

// 사용자 자신의 정보 업데이트
router.put("/me", verifyToken, userController.updateMyInfo);

// 모든 사용자 목록 조회 (미구현 돋보기에 사용예정)
router.get("/", verifyToken, userController.getUsers);

// 사용자 프로필 이미지를 기본 이미지로 설정
router.post("/me/profile/reset", verifyToken, userController.resetProfileImage);

module.exports = router;
