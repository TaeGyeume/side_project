module.exports = (io, socket) => {
  console.log(`Sync Handler initialized for socket: ${socket.id}`);

  // 클라이언트에서 동기화 요청
  socket.on("syncRequest", (data) => {
    const { userId } = data;

    // TODO: 필요한 데이터를 가져오도록 로직 작성
    // 예: 사용자 알림, 읽지 않은 메시지 등
    const syncedData = {
      notifications: [
        { id: 1, message: "You have a new follower!", isRead: false },
        { id: 2, message: "Your post received a comment!", isRead: false },
      ],
      unreadMessages: 5,
    };

    // 클라이언트로 동기화된 데이터 전송
    socket.emit("syncResponse", syncedData);
  });

  // 특정 데이터 업데이트 알림 브로드캐스트
  socket.on("updateData", (data) => {
    const { userId, updatedData } = data;

    // 모든 연결된 클라이언트에게 업데이트 알림
    io.emit("dataUpdated", { userId, updatedData });
  });

  // 사용자 연결 해제
  socket.on("disconnect", () => {
    console.log(`User disconnected from sync handler: ${socket.id}`);
  });
};