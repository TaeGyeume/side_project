const Room = require("../../models/Room");
const mongoose = require("mongoose");

exports.createRoom = async (req, res) => {
  const { userId1, userId2 } = req.body;

  console.log("Create Room Request Body:", req.body); // 디버깅용 로그
  console.log("Is userId1 valid?", mongoose.Types.ObjectId.isValid(userId1));
  console.log("Is userId2 valid?", mongoose.Types.ObjectId.isValid(userId2));

  if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
    return res.status(400).json({ error: "Invalid user IDs" });
  }

  try {
    const room = await Room.findOne({ members: { $all: [userId1, userId2] } });
    if (!room) {
      const newRoom = await Room.create({ members: [userId1, userId2] });
      console.log("Room created:", newRoom); // 새 방 로그
      return res.status(201).json({
        _id: newRoom._id, // 방 ID
        userIds: newRoom.members, // 방에 포함된 사용자 ID 배열
      });
    }
    console.log("Existing room found:", room); // 기존 방 로그
    res.status(200).json({
      _id: room._id, // 방 ID
      userIds: room.members, // 방에 포함된 사용자 ID 배열
    });
  } catch (err) {
    console.error("Error creating room:", err); // 에러 로그
    res.status(500).json({ error: "Failed to create room" });
  }
};

exports.getRoomDetails = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findById(roomId).populate("members", "username"); // 사용자 이름 포함
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      _id: room._id,
      userIds: room.members.map((member) => member._id),
      usernames: room.members.map((member) => member.username), // 사용자의 이름도 반환
    });
  } catch (error) {
    console.error("Failed to fetch room details:", error.message);
    res.status(500).json({ error: "Failed to fetch room details" });
  }
};
