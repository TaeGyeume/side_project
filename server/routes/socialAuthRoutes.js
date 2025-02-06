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

  // 액세스 토큰을 httpOnly 쿠키로 저장
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    maxAge: 15 * 60 * 1000  // 15분
  });

  // 리프레시 토큰을 httpOnly 쿠키로 저장
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7일
  });

  // 클라이언트로 리디렉션 (쿼리 파라미터 제거)
  res.redirect(`${process.env.CLIENT_URL}/facebook/callback`);
});


module.exports = router;