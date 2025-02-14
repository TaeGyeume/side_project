const express = require('express');
const router = express.Router();
const userMileageController = require('../controllers/userMileageController');

// ✅ 마일리지 조회 API (GET /api/user-mileages/:userId)
router.get('/:userId', userMileageController.getUserMileage);

module.exports = router;
