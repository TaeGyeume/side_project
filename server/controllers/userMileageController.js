const userMileageService = require('../services/userMileageService');
const User = require('../models/User');

// 마일리지 조회 (User 스키마의 mileage 반환)
exports.getUserMileage = async (req, res) => {
  const {userId} = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: '사용자를 찾을 수 없습니다.'});
    }
    res.status(200).json({mileage: user.mileage || 0});
  } catch (error) {
    console.error('마일리지 조회 중 오류:', error);
    res.status(500).json({message: '마일리지 조회 중 서버 오류'});
  }
};

// 마일리지 적립 (예약 후 결제 시 호출)
exports.addMileage = async (req, res) => {
  const {userId, amount, description} = req.body;
  try {
    const mileageRecord = await userMileageService.addMileage(
      userId,
      amount,
      description
    );
    res.status(201).json(mileageRecord);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 마일리지 사용
exports.useMileage = async (req, res) => {
  const {userId, amount, description} = req.body;
  try {
    const mileageRecord = await userMileageService.useMileage(
      userId,
      amount,
      description
    );
    res.status(201).json(mileageRecord);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// 마일리지 내역 조회
exports.getUserMileageHistory = async (req, res) => {
  const {userId} = req.params;
  try {
    const history = await userMileageService.getMileageHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
