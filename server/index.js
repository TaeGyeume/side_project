require("dotenv").config({ path: __dirname + "/../.env" }); // .env 파일 명시적 로드

const express = require("express");
const app = require("./app"); // Express 앱 가져오기
const connectDB = require("./config/db"); // MongoDB 연결 설정
const http = require("http"); // HTTP 서버 생성
const { Server } = require("socket.io"); // Socket.IO 추가
const socketHandler = require("./socket/socketHandler");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session"); // express-session 추가
const cors = require("cors");
const jwt = require("jsonwebtoken"); // JWT 라이브러리 추가

// MongoDB 연결
connectDB();

// HTTP 서버 생성
const server = http.createServer(app); // HTTP 서버로 변경

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

// CORS 설정
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, // 쿠키/세션 허용
};
app.use(cors(corsOptions)); // Express 앱에 CORS 추가

// express-session 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key", // 세션 암호화 키
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS 환경이 아닐 경우 false
  })
);

// Passport 설정
app.use(passport.initialize());
app.use(passport.session());

// Facebook Strategy 설정
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try { 
        console.log("Facebook profile:", profile);
        const user = await findOrCreateUser(profile); // MongoDB에서 사용자 저장/조회
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize/Deserialize 설정
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await findUserById(id); // MongoDB에서 사용자 찾기
  done(null, user);
});

// Facebook 로그인 라우트
app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

// Facebook 로그인 콜백 라우트
app.get(
  "/api/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = generateToken(req.user); // JWT 토큰 생성
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

// Socket.IO 설정
const io = new Server(server, {
  cors: corsOptions,
});
app.set("socketio", io); // Express 앱에 소켓 IO 객체 설정

// Socket.IO 핸들러 연결
socketHandler(io);

// 서버 실행
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// 유틸리티 함수 구현
// MongoDB에서 사용자 생성 또는 조회
async function findOrCreateUser(profile) {
  const User = require("./models/User"); // User 모델 가져오기
  let user = await User.findOne({ facebookId: profile.id });
  if (!user) {
    user = new User({
      username: profile.username || `user_${profile.id}`, // 기본값 설정
      facebookId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value || "No Email",
      isFacebookUser: true, // Facebook 사용자인지 설정
    });
    await user.save();
  }
  return user;
}

// MongoDB에서 사용자 조회
async function findUserById(id) {
  const User = require("./models/User"); // User 모델 가져오기
  return await User.findById(id);
}

// JWT 토큰 생성
function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "1h", // 토큰 유효 시간
  });
}