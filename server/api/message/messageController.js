const Room = require("../../models/Room");
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

    // 소켓을 통해 읽음 상태 변경 알림
    const io = req.app.get("socketio"); // 소켓 IO 가져오기
    io.to(roomId).emit("messagesRead", {
      roomId,
      userId, // 읽은 사용자 ID
    });

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

exports.getUnreadMessageCounts = async (req, res) => {
  console.log("getUnreadMessageCounts function called");
  const userId = req.user.id;

  console.log("User ID from token:", userId);
  if (!ObjectId.isValid(userId)) {
    console.error("Invalid user ID:", userId);
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const objectUserId = new ObjectId(userId);

  try {
    const counts = await Message.aggregate([
      {
        $match: {
          isRead: false,
          senderId: { $ne: objectUserId }, // 본인이 보낸 메시지는 제외
        },
      },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "roomDetails",
        },
      },
      { $unwind: "$roomDetails" },
      {
        $match: {
          "roomDetails.members": objectUserId, // 방 멤버가 로그인한 사용자와 매칭
        },
      },
      {
        $group: {
          _id: "$roomId", // 방 ID로 그룹화
          count: { $sum: 1 }, // 읽지 않은 메시지 합계
          lastSenderId: { $last: "$senderId" }, // 마지막 송신자
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastSenderId",
          foreignField: "_id",
          as: "lastSenderDetails",
        },
      },
      { $unwind: "$lastSenderDetails" },
      {
        $project: {
          roomId: "$_id",
          count: 1,
          lastSenderDetails: {
            _id: 1,
            username: 1,
            email: 1,
          },
        },
      },
    ]);

    console.log("Unread message counts by room:", counts);
    res.json(counts);
  } catch (error) {
    console.error("Error fetching unread message counts:", error.message);
    res.status(500).json({ message: "Failed to fetch unread message counts" });
  }
};
