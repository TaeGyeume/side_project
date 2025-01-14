const notificationHandler = require("./notification");
const chatHandler = require("./chat");
const syncHandler = require("./sync");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 사용자 ID 저장
    socket.on("setUserId", (userId) => {
      socket.userId = userId;
      console.log(`Socket ${socket.id} is associated with userId: ${userId}`);
    });

    // 알림 관련 이벤트
    notificationHandler(io, socket);

    // 채팅 관련 이벤트
    chatHandler(io, socket);

    // 동기화 관련 이벤트
    syncHandler(io, socket);

    // 연결 해제
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};