const Message = require("../../models/Message");

// 메시지 전송
exports.sendMessage = async (req, res) => {
  const { roomId, senderId, dtype, content, mediaUrl } = req.body;

  // 디버깅 로그 추가
  console.log("Request Body:", req.body);

  try {
    // 메시지 저장
    const message = await Message.create({
      roomId,
      senderId,
      dtype,
      content,
      mediaUrl,
      isRead: false,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// 메시지 읽음 처리
exports.markAsRead = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // 현재 사용자가 받은 메시지 중 읽지 않은 메시지 상태 업데이트
    const result = await Message.updateMany(
      { roomId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ updatedCount: result.modifiedCount });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// 사용자가 채팅방에 접속할 때, 채팅방의 모든 메시지 가져오기
exports.getMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.getUnreadMessagesCount = async (req, res) => {
  const { userId } = req.query;

  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId, // 현재 사용자가 받은 메시지
          isRead: false,      // 읽지 않은 메시지
        },
      },
      {
        $group: {
          _id: "$roomId",      // roomId별로 그룹화
          count: { $sum: 1 },  // 메시지 개수 합산
        },
      },
    ]);

    res.status(200).json(unreadCounts);
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    res.status(500).json({ message: "Failed to fetch unread message counts" });
  }
};
