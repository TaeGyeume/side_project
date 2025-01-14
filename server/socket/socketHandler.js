const messageHandler = require("./messageHandler");
const roomHandler = require("./roomHandler");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 사용자 ID 설정
    socket.on("setUserId", (userId) => {
      socket.userId = userId;
      console.log(`Socket ${socket.id} is associated with userId: ${userId}`);
    });

    // 핸들러 등록
    messageHandler(io, socket);
    roomHandler(io, socket);

    // 연결 해제 처리
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};