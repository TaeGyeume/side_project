const express = require('express');
const {getFlights, searchFlights} = require('../controllers/flightController');

const router = express.Router();

// ✈️ 모든 항공편 조회
router.get('/', getFlights);

// ✈️ 항공편 검색
router.get('/search', searchFlights);

module.exports = router;
