const couponService = require('../services/couponService');

// 쿠폰 생성 API (POST /api/coupons)
exports.createCoupon = async (req, res) => {
  try {
    const couponData = req.body;
    const newCoupon = await couponService.createCoupon(couponData);
    res.status(201).json({
      message: '쿠폰이 성공적으로 생성되었습니다.',
      coupon: newCoupon
    });
  } catch (error) {
    res.status(500).json({
      message: '쿠폰 생성 중 오류 발생',
      error: error.message
    });
  }
};

// 모든 쿠폰 조회 API
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.fetchAllCoupons();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({
      message: '쿠폰 목록 조회 중 오류 발생',
      error: error.message
    });
  }
};

// 유저 등급별 쿠폰 조회 API
exports.getCouponsByMembership = async (req, res) => {
  try {
    const {membershipLevel} = req.query;

    if (!membershipLevel) {
      return res.status(400).json({message: 'membershipLevel 값을 제공해야 합니다.'});
    }

    const coupons = await couponService.fetchCouponsByMembership(membershipLevel);
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({
      message: '쿠폰 조회 중 오류 발생',
      error: error.message
    });
  }
};

// 쿠폰 삭제 API (DELETE /api/coupons/:couponId)
exports.deleteCoupon = async (req, res) => {
  try {
    const {couponId} = req.params;
    const deletedCoupon = await couponService.deleteCoupon(couponId);

    res.status(200).json({
      message: '쿠폰이 성공적으로 삭제되었습니다.',
      deletedCoupon
    });
  } catch (error) {
    res.status(500).json({
      message: '쿠폰 삭제 중 오류 발생',
      error: error.message
    });
  }
};
