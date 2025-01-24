const express = require("express");
const { 
  register, 
  login, 
  getUserProfile, 
  refreshToken, 
  logout, 
  updateProfile, 
  changePassword, 
  forgotPassword, 
  resetPassword 
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 회원가입 (공개 API)
router.post("/register", register);

// 로그인 (공개 API - httpOnly 쿠키 설정)
router.post("/login", login);

// 로그아웃 (httpOnly 쿠키 삭제)
router.post("/logout", logout);

// 리프레시 토큰으로 액세스 토큰 갱신
router.post("/refresh-token", refreshToken);

// 보호된 사용자 정보 관련 라우트 (authMiddleware 적용)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile/update", authMiddleware, updateProfile);
router.put("/profile/change-password", authMiddleware, changePassword);

// 비밀번호 재설정 관련
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
