const userCouponService = require('../services/userCouponService');

// ✅ 사용자가 쿠폰을 받는 API
exports.claimCoupon = async (req, res) => {
  try {
    const {userId, couponId} = req.body;

    // 필수 값 확인
    if (!userId || !couponId) {
      return res.status(400).json({message: 'userId와 couponId를 모두 입력해주세요.'});
    }

    const newUserCoupon = await userCouponService.claimCoupon(userId, couponId);

    res.status(201).json({
      message: '쿠폰이 성공적으로 지급되었습니다.',
      userCoupon: newUserCoupon
    });
  } catch (error) {
    res.status(400).json({message: '쿠폰 지급 중 오류 발생', error: error.message});
  }
};
