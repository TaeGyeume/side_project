const express = require("express");
const router = express.Router();
const roomUnreadController = require("./roomUnreadController");

router.get("/:roomId/:userId", roomUnreadController.getUnreadMessages);

module.exports = router;
