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
      return res.status(201).json(newRoom);
    }
    console.log("Existing room found:", room); // 기존 방 로그
    res.status(200).json(room);
  } catch (err) {
    console.error("Error creating room:", err); // 에러 로그
    res.status(500).json({ error: "Failed to create room" });
  }
};
