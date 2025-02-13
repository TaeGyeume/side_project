const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// ✅ 쿠폰 생성 (POST /api/coupons) - 관리자만 가능
router.post('/', couponController.createCoupon);

// ✅ 모든 쿠폰 조회 (GET /api/coupons)
router.get('/', couponController.getAllCoupons);

// ✅ 유저 등급별 쿠폰 조회 API (GET /api/coupons/membership?membershipLevel=길잡이)
router.get('/membership', couponController.getCouponsByMembership);

// ✅ 쿠폰 삭제 (DELETE /api/coupons/:couponId)
router.delete('/:couponId', couponController.deleteCoupon);

module.exports = router;
