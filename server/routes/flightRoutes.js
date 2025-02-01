const express = require('express');
const router = express.Router();
const {getFlights, getFlightById} = require('../controllers/flightController');

// ✈️ 모든 항공편 조회
router.get('/', getFlights);

// ✈️ 특정 항공편 조회 (ID 기준)
router.get('/:id', getFlightById);

module.exports = router;
