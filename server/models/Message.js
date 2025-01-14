const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true }, // Room 모델 참조
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User 모델 참조
  dtype: { type: String, enum: ["text", "image", "file"], required: true }, // 메시지 타입
  content: { type: String }, // 텍스트 메시지 내용
  mediaUrl: { type: String }, // 이미지, 파일 등의 URL
  isRead: { type: Boolean, default: false }, // 읽음 여부
  createdAt: { type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000), },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
// 메세지 정보 저장