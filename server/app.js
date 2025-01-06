const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

//라우트 파일 불러오기
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const roomUnreadRoutes = require("./routes/roomUnreadRoutes");

const app = express();

// CORS 설정
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// 미들웨어 설정
app.use(bodyParser.json());

// 라우트 연결
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes); // 메시지 관련 라우트
app.use("/api/rooms", roomRoutes); // 채팅방 관련 라우트
app.use("/api/rooms/unread", roomUnreadRoutes); // 읽지 않은 메시지 관련 라우트

module.exports = app;
