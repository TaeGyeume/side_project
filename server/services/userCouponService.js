const UserCoupon = require('../models/UserCoupon');
const Coupon = require('../models/Coupon');
const moment = require('moment-timezone');

// 사용자가 쿠폰을 받는 서비스
exports.claimCoupon = async (userId, couponId) => {
  try {
    // 쿠폰이 존재하는지 확인
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error('해당 쿠폰을 찾을 수 없습니다.');
    }

    // 유저가 동일한 쿠폰을 이미 받았는지 확인 (중복 방지)
    const existingUserCoupon = await UserCoupon.findOne({
      user: userId,
      coupon: couponId
    });
    if (existingUserCoupon) {
      throw new Error('이미 해당 쿠폰을 보유하고 있습니다.');
    }

    // `UserCoupon` 테이블에 쿠폰 지급 (쿠폰의 `expiresAt` 유지)
    const newUserCoupon = new UserCoupon({
      user: userId,
      coupon: couponId,
      issuedAt: moment().tz('Asia/Seoul').toDate(),
      expiresAt: coupon.expiresAt // 쿠폰 만료일 적용
    });

    await newUserCoupon.save();
    return newUserCoupon;
  } catch (error) {
    throw new Error('쿠폰 지급 중 오류 발생: ' + error.message);
  }
};

// 사용자가 받은 쿠폰 조회 서비스 (만료 여부 추가)
exports.fetchUserCoupons = async userId => {
  try {
    const currentDate = moment().tz('Asia/Seoul').toDate(); // 현재 시간 가져오기

    const userCoupons = await UserCoupon.find({user: userId})
      .populate('coupon') // 쿠폰 정보 함께 조회
      .sort({expiresAt: -1}); // 만료일 기준으로 정렬

    // 만료 여부 추가 (isExpired 필드)
    const formattedCoupons = userCoupons.map(coupon => {
      return {
        ...coupon._doc,
        isExpired: coupon.expiresAt < currentDate // 현재 시간이 만료일보다 크면 true
      };
    });

    return formattedCoupons;
  } catch (error) {
    throw new Error('사용자의 쿠폰 조회 중 오류 발생: ' + error.message);
  }
};
