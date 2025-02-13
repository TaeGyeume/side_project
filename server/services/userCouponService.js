const UserCoupon = require('../models/UserCoupon');
const Coupon = require('../models/Coupon');
const moment = require('moment-timezone');

// ✅ 사용자가 쿠폰을 받는 로직
const userCouponService = {
  async claimCoupon(userId, couponId) {
    try {
      // 1️⃣ 쿠폰이 존재하는지 확인
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        throw new Error('해당 쿠폰을 찾을 수 없습니다.');
      }

      // 2️⃣ 유저가 동일한 쿠폰을 이미 받았는지 확인 (중복 방지)
      const existingUserCoupon = await UserCoupon.findOne({
        user: userId,
        coupon: couponId
      });
      if (existingUserCoupon) {
        throw new Error('이미 해당 쿠폰을 보유하고 있습니다.');
      }

      // 3️⃣ `UserCoupon` 테이블에 쿠폰 지급 (쿠폰의 `expiresAt` 유지)
      const newUserCoupon = new UserCoupon({
        user: userId,
        coupon: couponId,
        issuedAt: moment().tz('Asia/Seoul').toDate(),
        expiresAt: coupon.expiresAt // ✅ 쿠폰 만료일 적용
      });

      await newUserCoupon.save();
      return newUserCoupon;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

module.exports = userCouponService;
