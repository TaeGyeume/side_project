// controllers/userMileageController.js
const userMileageService = require('../services/userMileageService');

// ✅ 마일리지 조회 API
exports.getUserMileage = async (req, res) => {
  const {userId} = req.params;
  console.log(`🔍 마일리지 조회 요청 - userId: ${userId}`);

  if (!userId) {
    return res.status(400).json({message: '사용자 ID가 필요합니다.'});
  }

  try {
    const mileage = await userMileageService.fetchUserMileage(userId);
    if (mileage === null) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }

    res.status(200).json({mileage});
  } catch (error) {
    console.error('🚨 마일리지 조회 중 오류:', error);
    res.status(500).json({message: '서버 오류'});
  }
};
