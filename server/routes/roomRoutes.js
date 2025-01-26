const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// ✅ 객실 추가 API (POST /api/rooms)
router.post("/", roomController.createRoom);

module.exports = router;
