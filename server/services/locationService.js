const Location = require('../models/Location');

// 🔹 여행지 추가 함수
exports.createLocation = async locationData => {
  try {
    const newLocation = new Location(locationData);
    await newLocation.save();
    return newLocation;
  } catch (error) {
    throw new Error('여행지 추가 중 오류 발생: ' + error.message);
  }
};

// 모든 여행지 조회 서비스
exports.getLocations = async () => {
  return await Location.find();
};
