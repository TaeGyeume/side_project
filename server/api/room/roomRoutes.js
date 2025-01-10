const express = require("express");
const router = express.Router();
const roomController = require("./roomController");

router.post("/create", roomController.createRoom);
router.get("/:roomId", roomController.getRoomDetails);

module.exports = router;
