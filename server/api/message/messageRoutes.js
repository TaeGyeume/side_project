const express = require("express");
const router = express.Router();
const messageController = require("../message/messageController");
const {verifyToken} = require("../../middleware/auth");

router.post("/send", messageController.sendMessage);
router.patch("/read/:messageId", messageController.markAsRead);
router.get("/unread", verifyToken, messageController.getUnreadMessageCounts);
router.get("/chatUsers", messageController.getChatUsers);
router.post("/mark-as-read", messageController.markAsRead);
router.get("/:roomId", messageController.getMessages);

module.exports = router;
