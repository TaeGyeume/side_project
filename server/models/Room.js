const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }], // 참여자 목록
  createdAt: { type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000), },
  updatedAt: { type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000), },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
// 채팅방 정보 관리, 각 방에 두 명의 사용자 포함