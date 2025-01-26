const express = require("express");
const router = express.Router();
const accommodationController = require("../controllers/accommodationController");

// ✅ 숙소 생성 API (POST /api/accommodations)
router.post("/", accommodationController.createAccommodation);

module.exports = router;
