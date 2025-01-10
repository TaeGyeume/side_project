const express = require("express");
const router = express.Router();
const messageController = require("../message/messageController");
const {verifyToken} = require("../../middleware/auth");

router.post("/send", messageController.sendMessage);
router.patch("/read/:messageId", messageController.markAsRead);
router.get("/unread", (req, res, next) => {
  console.log("Request reached /unread route");
  next();
}, verifyToken, messageController.getUnreadMessageCounts);
router.get("/:roomId", messageController.getMessages);
router.post("/mark-as-read", messageController.markAsRead);

module.exports = router;
