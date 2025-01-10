// require("dotenv").config(); // 환경 변수 로드
require("dotenv").config({ path: __dirname + "/../.env" }); // 서버 폴더의 .env 파일을 명시적으로 로드

const app = require("./app"); // Express 앱 가져오기
const connectDB = require("./config/db"); // MongoDB 연결 설정
const http = require("http"); // HTTP 서버 생성
const { Server } = require("socket.io"); // Socket.IO 추가
const Message = require("./models/Message"); // 메시지 모델 임포트
const Room = require("./models/Room"); // Room 모델 가져오기

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

// Socket.IO 실시간 이벤트 처리
io.on("connection", (socket) => {
  if (process.env.DEBUG_MODE === "true") {
    console.log(`User connected: ${socket.id}`);
  }

  // 사용자 ID를 소켓에 저장
  socket.on("setUserId", (userId) => {
    socket.userId = userId;
    console.log(`Socket ${socket.id} is associated with userId: ${userId}`);
  });

  // 방 참여 이벤트
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId); // 소켓을 특정 방에 참여시킴
    console.log(`User ${socket.id} joined room: ${roomId}`); // 방 참여 로그
  });

  // 메시지 전송 이벤트
  socket.on("sendMessage", async (data) => {
    console.log("Message received on server:", data); // 수신한 메시지 데이터 로그
    const { roomId, senderId, dtype, content, mediaUrl } = data;

    // MongoDB에 메시지 저장
  try {
    const newMessage = new Message({
      roomId,
      senderId,
      dtype,
      content,
      mediaUrl,
      isRead: false,
      createdAt: new Date(),
    });

    // 메시지 저장
    await newMessage.save();
    console.log("Message saved to DB:", newMessage);

    // 방에 있는 소켓 확인
    const roomSockets = await io.in(roomId).fetchSockets();
    const isRecipientInRoom = roomSockets.some(
      (socket) => socket.userId && socket.userId !== senderId // 발신자가 아닌 사용자 찾기
    );

    // 방에 사용자가 있으면 메시지를 읽음 처리
    if (isRecipientInRoom) {
      newMessage.isRead = true;
      await newMessage.save();
      console.log("Message marked as read automatically:", newMessage);

      // 읽음 상태 업데이트 이벤트 전송
      io.to(roomId).emit("messageRead", {
        roomId,
        messageId: newMessage._id,
      });
    }

    // 저장된 메시지를 다른 사용자에게 브로드캐스트
    io.to(roomId).emit("receiveMessage", newMessage);
    console.log("Message broadcasted to room:", roomId); // 메시지 브로드캐스트 로그
    
    const unreadCount = await Message.countDocuments({ roomId, isRead: false });
    io.to(roomId).emit("unreadCountUpdate", { roomId, unreadCount });

  } catch (error) {
    console.error("Error saving message to DB:", error);
  }
});

  // 읽음 처리 이벤트
  socket.on("markAsRead", async (data) => {
    const { messageId } = data;
  
    try {
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { isRead: true },
        { new: true } // 업데이트된 문서를 반환
      );
  
      if (!updatedMessage) {
        throw new Error("Message not found");
      }
  
      io.to(updatedMessage.roomId).emit("messageRead", { roomId: updatedMessage.roomId, messageId });
    } catch (error) {
      console.error("Error marking message as read:", error.message);
      socket.emit("error", { message: error.message });
    }
  });

  // 사용자 연결 해제
  socket.on("disconnect", () => {
    if (process.env.DEBUG_MODE === "true") {
      console.log(`User disconnected: ${socket.id}`);
    }
  });
});

