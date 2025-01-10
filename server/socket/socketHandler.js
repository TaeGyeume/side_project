const Message = require("../models/Message");
const { ObjectId } = require("mongoose").Types;

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 사용자 ID를 소켓에 저장
    socket.on("setUserId", (userId) => {
      socket.userId = userId;
      console.log(`Socket ${socket.id} is associated with userId: ${userId}`);
    });

    // 방 참여 이벤트
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // 메시지 전송 이벤트
    socket.on("sendMessage", async (data) => {
      const { roomId, senderId, dtype, content, mediaUrl } = data;

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

        // 방에 사용자가 있으면 메시지를 자동으로 읽음 처리
        const roomSockets = await io.in(roomId).fetchSockets();
        const isRecipientInRoom = roomSockets.some(
          (socket) => socket.userId && socket.userId !== senderId
        );

        if (isRecipientInRoom) {
          newMessage.isRead = true;
          await newMessage.save();

          // 읽음 상태 업데이트 전송
          io.to(roomId).emit("messageRead", {
            roomId,
            messageId: newMessage._id,
          });
        }

        // 저장된 메시지 브로드캐스트
        io.to(roomId).emit("receiveMessage", newMessage);

        // 읽지 않은 메시지 수 브로드캐스트
        const unreadCount = await Message.countDocuments({
          roomId,
          isRead: false,
        });
        io.to(roomId).emit("unreadCountUpdate", { roomId, unreadCount });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // 읽음 처리 이벤트
    socket.on("markAsRead", async (data) => {
      const { roomId, userId } = data;

      try {
        const result = await Message.updateMany(
          { roomId, senderId: { $ne: userId }, isRead: false },
          { $set: { isRead: true } }
        );

        io.to(roomId).emit("messagesRead", { roomId, userId });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // 사용자 연결 해제
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
