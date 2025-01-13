const express = require("express");
const authController = require("./authController");
const router = express.Router();

// 회원가입
router.post("/register", authController.register);

// 로그인
router.post("/login", authController.login);

// Facebook 로그인 (리디렉션)
router.get("/facebook", authController.facebookLogin);

// Facebook 로그인 콜백
router.get("/facebook/callback", authController.facebookLoginCallback);

module.exports = router;
