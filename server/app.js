const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
require("./config/passport");
const path = require("path");
const fs = require("fs");
const messageRoutes = require("./api/message/messageRoutes");
const roomRoutes = require("./api/room/roomRoutes")
const roomUnreadRoutes = require("./api/roomUnread/roomUnreadRoutes");

const app = express();

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 정적 파일 제공: "uploads" 디렉토리를 "/uploads" 경로에 매핑
app.use("/uploads", express.static(uploadDir));

// JSON 및 URL Encoded 파싱
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Passport 초기화
app.use(passport.initialize());

// API 라우트 설정
app.use("/api/users", userRoutes); // 사용자 관련 라우트
app.use("/api/auth", authRoutes); // 인증 관련 라우트
app.use("/api/messages", messageRoutes); // 메시지 관련 라우트
app.use("/api/rooms", roomRoutes); // 채팅방 관련 라우트
app.use("/api/rooms/unread", roomUnreadRoutes); // 읽지 않은 메시지 관련 라우트

// React 정적 파일 제공
const clientBuildPath = path.join(__dirname, "../client/build");
if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));

    // React 라우터를 처리하기 위한 모든 요청을 index.html로 리다이렉트
    app.get("*", (req, res) => {
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
} else {
    console.warn("클라이언트 빌드 폴더를 찾을 수 없습니다. React 정적 파일이 제공되지 않습니다.");
}

module.exports = app;
