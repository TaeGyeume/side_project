const Message = require("../models/Message");

// 메시지 전송
exports.sendMessage = async (req, res) => {
  const { roomId, senderId, dtype, content, mediaUrl } = req.body;

  try {
    // 메시지 저장
    const message = await Message.create({
      roomId,
      senderId,
      dtype,
      content,
      mediaUrl,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// 메시지 읽음 처리
exports.markAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true } // 업데이트된 메시지를 반환
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark message as read" });
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