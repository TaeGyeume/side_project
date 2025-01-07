const express = require("express");
const router = express.Router();
const messageController = require("./messageController");

router.post("/send", messageController.sendMessage);
router.patch("/read/:messageId", messageController.markAsRead);
router.get("/:roomId", messageController.getMessages);

module.exports = router;
