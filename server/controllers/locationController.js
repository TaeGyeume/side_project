const locationService = require('../services/locationService');

// 여행지 추가 API
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

// 여행지 수정 API (PATCH /api/locations/:locationId)
exports.updateLocation = async (req, res) => {
  try {
    const {locationId} = req.params;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({message: '업데이트할 데이터를 입력해주세요.'});
    }

    const updatedLocation = await locationService.updateLocation(locationId, updateData);

    res
      .status(200)
      .json({message: '여행지가 수정되었습니다.', location: updatedLocation});
  } catch (error) {
    res.status(500).json({message: '여행지 수정 중 오류 발생', error: error.message});
  }
};

// 여행지 삭제 API (DELETE /api/locations/:locationId)
exports.deleteLocation = async (req, res) => {
  try {
    const {locationId} = req.params;

    await locationService.deleteLocation(locationId);

    res.status(200).json({message: '여행지가 삭제되었습니다.'});
  } catch (error) {
    res.status(500).json({message: '여행지 삭제 중 오류 발생', error: error.message});
  }
};

// 모든 여행지 조회
exports.getLocations = async (req, res) => {
  try {
    const locations = await locationService.getLocations();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({message: '여행지 조회 중 오류 발생', error: error.message});
  }
};

// 도시 및 국가 검색 API
exports.searchLocations = async (req, res) => {
  try {
    const {query} = req.query;

    if (!query) {
      return res.status(400).json({message: '검색어를 입력해주세요.'});
    }

    const locations = await locationService.searchLocations(query);
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({message: '도시/국가 검색 중 오류 발생', error: error.message});
  }
};

// 국가 목록 조회 API
exports.getCountries = async (req, res) => {
  try {
    const countries = await locationService.getCountries();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({message: '국가 목록 조회 중 오류 발생', error: error.message});
  }
};

// 특정 국가의 도시 목록 조회 API
exports.getCitiesByCountry = async (req, res) => {
  try {
    const {country} = req.query;
    if (!country) {
      return res.status(400).json({message: '국가명을 입력해주세요.'});
    }

    const cities = await locationService.getCitiesByCountry(country);
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({message: '도시 목록 조회 중 오류 발생', error: error.message});
  }
};

// 특정 위치 조회 API
exports.getLocationById = async (req, res) => {
  try {
    const {locationId} = req.params;
    const location = await locationService.getLocationById(locationId);

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({message: '위치 조회 중 오류 발생', error: error.message});
  }
};
