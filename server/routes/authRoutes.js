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

// 회원가입 라우트
router.post("/register", register);

// 로그인 라우트 (쿠키 기반 인증 적용)
router.post("/login", login);

// 로그아웃 라우트 (쿠키 제거 방식 적용)
router.post("/logout", logout);

// 리프레시 토큰을 이용한 액세스 토큰 갱신 (쿠키 기반)
router.post("/refresh-token", refreshToken);

// 보호된 사용자 프로필 조회 (httpOnly 쿠키 기반 인증 필요)
router.get("/profile", authMiddleware, getUserProfile);

// 사용자 프로필 수정 (httpOnly 쿠키 기반 인증 필요)
router.put("/update-profile", authMiddleware, updateProfile);

// 비밀번호 변경 (httpOnly 쿠키 기반 인증 필요)
router.put("/change-password", authMiddleware, changePassword);

// 비밀번호 찾기 요청 
router.post("/forgot-password", forgotPassword);

// 비밀번호 재설정 처리 
router.post("/reset-password", resetPassword);

module.exports = router;
