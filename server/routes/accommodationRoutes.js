const express = require("express");
const router = express.Router();
const accommodationController = require("../controllers/accommodationController");

// ✅ 숙소 생성 API (POST /api/accommodations)
router.post("/", accommodationController.createAccommodation);
// ✅ 자동완성 검색
router.get("/autocomplete", accommodationController.autocompleteSearch);
// ✅ 날짜 및 인원수에 맞는 숙소 검색
router.get("/search", accommodationController.getAccommodationsBySearch);

module.exports = router;
