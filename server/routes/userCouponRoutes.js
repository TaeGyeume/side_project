const express = require('express');
const router = express.Router();
const userCouponController = require('../controllers/userCouponController');

// ✅ 쿠폰 받기 (POST /api/user-coupons/claim) - 로그인한 사용자만 가능
router.post('/claim', userCouponController.claimCoupon);

module.exports = router;
