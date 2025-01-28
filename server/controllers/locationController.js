const locationService = require('../services/locationService');

// 🔹 여행지 추가 API
exports.createLocation = async (req, res) => {
  try {
    const locationData = req.body;
    const newLocation = await locationService.createLocation(locationData);
    res
      .status(201)
      .json({message: '여행지가 성공적으로 추가되었습니다.', location: newLocation});
  } catch (error) {
    res.status(500).json({message: '여행지 추가 중 오류 발생', error: error.message});
  }
};

// 모든 여행지 조회
exports.getLocations = async (req, res) => {
  try {
    const locations = await locationService.getLocations();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: "여행지 조회 중 오류 발생", error: error.message });
  }
};
