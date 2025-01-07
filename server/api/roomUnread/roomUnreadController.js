const RoomUnread = require("../../models/RoomUnread");

// 읽지 않은 메시지 관리
exports.getUnreadMessages = async (req, res) => {
  const { roomId, userId } = req.params;

  try {
    const unreadMessages = await RoomUnread.find({ roomId, userId });
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unread messages" });
  }
};
