const express = require('express');
const {
  getFlights,
  searchFlights,
  searchFlightsByRoute
} = require('../controllers/flightController');

const router = express.Router();

// 모든 항공편 조회
router.get('/', getFlights);

// 항공편 검색
router.get('/search', searchFlights);

// 출발지 & 도착지 기반 항공편 검색 API
router.get('/search-by-route', searchFlightsByRoute);

module.exports = router;
