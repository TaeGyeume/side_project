const Coupon = require('../models/Coupon');

// ✅ 쿠폰 생성 서비스
exports.createCoupon = async couponData => {
  try {
    const newCoupon = new Coupon(couponData);
    await newCoupon.save();
    return newCoupon;
  } catch (error) {
    throw new Error('쿠폰 생성 중 오류 발생: ' + error.message);
  }
};

// ✅ 모든 쿠폰 조회 서비스
exports.fetchAllCoupons = async () => {
  try {
    return await Coupon.find().sort({createdAt: -1}); // 최신순 정렬
  } catch (error) {
    throw new Error('쿠폰 목록 조회 중 오류 발생: ' + error.message);
  }
};

// ✅ 유저 등급별 쿠폰 조회 서비스
exports.fetchCouponsByMembership = async membershipLevel => {
  try {
    const coupons = await Coupon.find({applicableMemberships: membershipLevel}).sort({
      createdAt: -1
    });
    return coupons;
  } catch (error) {
    throw new Error('쿠폰 조회 중 오류 발생: ' + error.message);
  }
};

// ✅ 쿠폰 삭제 서비스
exports.deleteCoupon = async couponId => {
  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      throw new Error('해당 쿠폰을 찾을 수 없습니다.');
    }

    return deletedCoupon;
  } catch (error) {
    throw new Error('쿠폰 삭제 중 오류 발생: ' + error.message);
  }
};
