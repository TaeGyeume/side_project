// services/userMileageService.js
const User = require('../models/User');

// ✅ 마일리지 조회 서비스
exports.fetchUserMileage = async userId => {
  try {
    const user = await User.findById(userId);
    return user ? user.mileage : null;
  } catch (error) {
    console.error('🚨 마일리지 조회 서비스 오류:', error);
    throw new Error('마일리지 조회 실패');
  }
};
