const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User"); // User 모델 가져오기
// require("dotenv").config(); // 환경 변수 로드
require("dotenv").config({ path: __dirname + "/../.env" }); // 서버 폴더의 .env 파일을 명시적으로 로드

// Facebook Strategy 설정
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID, // 환경 변수에서 Facebook App ID 가져오기
      clientSecret: process.env.FACEBOOK_APP_SECRET, // 환경 변수에서 Facebook App Secret 가져오기
      callbackURL: "http://localhost:5000/auth/facebook/callback", // OAuth Redirect URI
      profileFields: ["id", "displayName", "emails"], // Facebook에서 가져올 데이터 필드
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Facebook 프로필 검증 및 사용자 ID 가져오기
        if (!profile || !profile.id) {
          return done(null, false, { message: "Invalid Facebook profile" });
        }

        // 기존 사용자 찾기
        let user = await User.findOne({ facebookId: profile.id });

        // 사용자 정보가 없으면 새로 생성
        if (!user) {
          user = new User({
            username: profile.displayName || "Unknown User", // 이름이 없는 경우 기본값
            email: profile.emails?.[0]?.value || "no-email@facebook.com", // 이메일 없으면 기본값
            facebookId: profile.id,
            created_at: new Date(),
            updated_at: new Date(),
          });

          await user.save();
        } else {
          // 기존 사용자 정보 업데이트
          user.updated_at = new Date(); // 업데이트 시간 갱신
          await user.save();
        }

        return done(null, user); // 사용자 인증 성공
      } catch (error) {
        console.error("Error in Facebook strategy:", error);
        return done(error, null); // 인증 실패 시 에러 반환
      }
    }
  )
);

// 세션 관리
passport.serializeUser((user, done) => {
  if (!user || !user.id) {
    return done(new Error("Invalid user data for serialization"), null);
  }
  done(null, user.id); // 사용자 ID를 세션에 저장
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("User not found during deserialization"), null);
    }
    done(null, user); // 세션에서 사용자 복원
  } catch (error) {
    console.error("Error during deserialization:", error);
    done(error, null);
  }
});
