const Message = require("../../models/Message");
const { ObjectId } = require("mongoose").Types;

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

exports.markAsRead = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    console.log("Marking messages as read in room:", roomId, "for user:", userId); // 디버깅 로그

    const result = await Message.updateMany(
      { roomId, senderId: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    console.log("Update result:", result); // MongoDB 결과 로그
    res.json({ updatedCount: result.modifiedCount });
  } catch (error) {
    console.error("Failed to mark messages as read:", error.message);
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

exports.getUnreadMessagesRooms = async (req, res) => {
  const { userId } = req.query;
  console.log("Unread Rooms API called with userId:", userId); // 요청 로그

  try {
    const unreadRooms = await Message.aggregate([
      {
        $match: {
          senderId: { $ne: ObjectId(userId) }, // 반드시 ObjectId로 변환
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$roomId", // roomId별로 그룹화
        },
      },
    ]);

    console.log("Unread Rooms Result:", unreadRooms); // 결과 로그
    res.status(200).json(unreadRooms.map((room) => room._id)); // roomId만 반환
  } catch (error) {
    console.error("Error fetching unread rooms:", error);
    res.status(500).json({ message: "Failed to fetch unread rooms" });
  }
};
