const accommodationService = require('../services/accommodationService');

// ✅ 숙소 생성 컨트롤러
exports.createAccommodation = async (req, res) => {
  try {
    const accommodationData = req.body;
    const newAccommodation = await accommodationService.createAccommodation(
      accommodationData
    );
    res.status(201).json({
      message: '숙소가 성공적으로 생성되었습니다.',
      accommodation: newAccommodation
    });
  } catch (error) {
    res.status(500).json({message: '숙소 생성 중 오류 발생', error: error.message});
  }
};

/**
 * 🔹 자동완성 검색 API
 * @route GET /api/accommodations/autocomplete?query=서울
 */
exports.autocompleteSearch = async (req, res) => {
  try {
    const {query} = req.query;
    const results = await accommodationService.autocompleteSearch(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({message: '자동완성 검색 중 오류 발생', error: error.message});
  }
};

/**
 * 🔹 날짜 및 인원수에 맞는 숙소 검색 API
 * @route GET /api/accommodations/search?city=서울&startDate=2025-02-01&endDate=2025-02-03&adults=2
 */
exports.getAccommodationsBySearch = async (req, res) => {
  try {
    const {city, startDate, endDate, adults} = req.query;

    if (!city || !startDate || !endDate || !adults) {
      return res
        .status(400)
        .json({message: '검색 조건(city, startDate, endDate, adults)을 입력해주세요.'});
    }

    const accommodations = await accommodationService.getAccommodationsBySearch({
      city,
      startDate,
      endDate,
      adults
    });
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({message: '숙소 검색 중 오류 발생', error: error.message});
  }
};
