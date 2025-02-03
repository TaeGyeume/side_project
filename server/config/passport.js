const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');  // User 모델 불러오기

// 페이스북 전략 설정
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,           // .env 파일에서 페이스북 앱 ID 불러오기
  clientSecret: process.env.FACEBOOK_APP_SECRET,   // .env 파일에서 페이스북 앱 시크릿 불러오기
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,  // 콜백 URL 설정
  profileFields: ['id', 'emails', 'name']          // 가져올 페이스북 프로필 필드 설정
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // 페이스북 소셜 ID로 기존 사용자 찾기
    let user = await User.findOne({ provider: 'facebook', socialId: profile.id });

    if (!user) {
      // 새 사용자 생성
      user = new User({
        provider: 'facebook',
        socialId: profile.id,
        email: profile.emails ? profile.emails[0].value : '',
        username: `${profile.name.givenName} ${profile.name.familyName}`,
      });
      await user.save();
    }

    return done(null, user);  // 사용자 반환
  } catch (err) {
    return done(err, null);  // 에러 처리
  }
}));

// Passport 세션 설정 (JWT 사용 시 필요 없지만 기본 구조 유지)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
