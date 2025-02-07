const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 여행지 추가 (POST /api/locations)
router.post('/', locationController.createLocation);
// ✅ 여행지 수정 (PATCH /api/locations/:locationId)
router.patch('/:locationId', locationController.updateLocation);
// ✅ 여행지 삭제 (DELETE /api/locations/:locationId)
router.delete('/:locationId', locationController.deleteLocation);
// 모든 여행지 조회
router.get('/', locationController.getLocations);
// 도시 및 국가 검색 API (GET /api/locations/search?query=서울)
router.get('/search', locationController.searchLocations);
// 국가 목록 조회 (GET /api/locations/countries)
router.get('/countries', locationController.getCountries);
// 특정 국가의 도시 목록 조회 (GET /api/locations/cities?country=대한민국)
router.get('/cities', locationController.getCitiesByCountry);
// ✅ 특정 위치 조회 API 추가 (GET /api/locations/:locationId)
router.get('/:locationId', locationController.getLocationById);

module.exports = router;
