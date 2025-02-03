const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT 토큰 생성 함수
const generateTokens = user => {
  const accessToken = jwt.sign(
    { id: user._id, provider: user.provider },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user._id, provider: user.provider },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// 페이스북 로그인 시작
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// 페이스북 콜백 처리
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
  const tokens = generateTokens(req.user);

  // 리프레시 토큰을 httpOnly 쿠키로 저장
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  // 클라이언트로 액세스 토큰 전달 (리디렉션)
  res.redirect(`${process.env.CLIENT_URL}?token=${tokens.accessToken}`);
});

module.exports = router;