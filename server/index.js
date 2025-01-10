// require("dotenv").config(); // 환경 변수 로드
require("dotenv").config({ path: __dirname + "/../.env" }); // 서버 폴더의 .env 파일을 명시적으로 로드

const app = require("./app"); // Express 앱 가져오기
const connectDB = require("./config/db"); // MongoDB 연결 설정
const http = require("http"); // HTTP 서버 생성
const { Server } = require("socket.io"); // Socket.IO 추가
const socketHandler = require("./socket/socketHandler");

// MongoDB 연결
connectDB();

// HTTP 서버 생성
const server = http.createServer(app); // HTTP 서버로 변경

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

console.log("CLIENT_URL:", process.env.CLIENT_URL);

// 서버 실행
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Socket.IO 설정
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // CORS 설정
    credentials: true,
  },
});
app.set("socketio", io); // Express 앱에 소켓 IO 객체 설정

// Socket.IO 핸들러 연결
socketHandler(io);
