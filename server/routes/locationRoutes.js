const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 여행지 추가 (POST /api/locations)
router.post('/', locationController.createLocation);
// 모든 여행지 조회
router.get('/', locationController.getLocations);
// 도시 및 국가 검색 API (GET /api/locations/search?query=서울)
router.get('/search', locationController.searchLocations);

module.exports = router;
