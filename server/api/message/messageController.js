const Room = require("../../models/Room");
const Message = require("../../models/Message");
const { ObjectId } = require("mongoose").Types;
const User = require("../../models/User");

exports.getChatUsers = async (req, res) => {
  const { userId } = req.query; // 로그인한 사용자의 ID

  try {
    // 사용자가 포함된 채팅방 가져오기
    const rooms = await Room.find({ members: userId });

    // 채팅방에 포함된 사용자 ID 가져오기
    const userIds = rooms.flatMap((room) =>
      room.members.filter((member) => member.toString() !== userId)
    );

    // 중복된 사용자 제거 및 사용자 정보 가져오기
    const users = await User.find({ _id: { $in: [...new Set(userIds)] } }).select(
      "_id username email"
    );

    // 각 채팅방의 마지막 메시지 가져오기
    const lastMessages = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room._id })
          .sort({ createdAt: -1 }) // 가장 최신 메시지를 가져오기 위해 정렬
          .limit(1); // 하나만 가져오기
        return {
          roomId: room._id,
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );
    // 사용자 정보와 마지막 메시지 병합
    const userWithLastMessage = users.map((user) => {
      const roomInfo = lastMessages.find((room) =>
        rooms.some(
          (r) =>
            r.members.includes(user._id.toString()) && r._id.toString() === room.roomId.toString()
        )
      );
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        lastMessage: roomInfo?.lastMessage || "No messages yet",
        lastMessageTime: roomInfo?.lastMessageTime || null,
      };
    });

    res.status(200).json(userWithLastMessage);
    // res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch chat users:", error.message);
    res.status(500).json({ error: "Failed to fetch chat users" });
  }
};

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

exports.leaveRoom = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // 사용자가 나갈 때 방에 메시지가 없으면 방 삭제
    const hasMessages = await Message.exists({ roomId });
    if (!hasMessages) {
      await Room.findByIdAndDelete(roomId);
      console.log("Room deleted because it had no messages:", roomId);
    }

    res.status(200).json({ message: "User left the room." });
  } catch (error) {
    console.error("Error leaving room:", error.message);
    res.status(500).json({ error: "Failed to leave room" });
  }
};
