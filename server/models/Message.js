const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // 채팅방 ID
  senderId: { type: String, required: true }, // 메시지 보낸 사용자
  dtype: { type: String, enum: ["text", "image", "file"], required: true }, // 메시지 타입
  content: { type: String }, // 텍스트 메시지 내용
  mediaUrl: { type: String }, // 이미지, 파일 등의 URL
  isRead: { type: Boolean, default: false }, // 읽음 여부
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
// 메세지 정보 저장