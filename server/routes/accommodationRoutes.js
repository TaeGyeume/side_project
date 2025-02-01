const express = require('express');
const router = express.Router();
const accommodationController = require('../controllers/accommodationController');

// 숙소 생성 API (POST /api/accommodations)
router.post('/', accommodationController.createAccommodation);
// 자동완성 검색
router.get('/autocomplete', accommodationController.autocompleteSearch);
// 날짜 및 인원수에 맞는 숙소 검색
router.get('/search', accommodationController.getAccommodationsBySearch);
// 특정 숙소의 검색 조건에 맞는 객실 조회 API
router.get(
  '/:accommodationId/rooms',
  accommodationController.getAvailableRoomsByAccommodation
);
// 숙소 업데이트 API (PATCH /api/accommodations/:accommodationId)
router.patch('/:accommodationId', accommodationController.updateAccommodation);
// 숙소 삭제 API (DELETE /api/accommodations/:accommodationId)
router.delete('/:accommodationId', accommodationController.deleteAccommodation);
// ✅ 숙소 전체 리스트 조회 API (GET /api/accommodations/list)
router.get('/list', accommodationController.getAllAccommodations);

module.exports = router;
