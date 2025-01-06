const mongoose = require("mongoose");

const roomUnreadSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // 채팅방 ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 읽지 않은 사용자
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true }, // 읽지 않은 메시지
});

const RoomUnread = mongoose.model("RoomUnread", roomUnreadSchema);

module.exports = RoomUnread;
// 읽지 않은 메세지를 사용자별로 관리