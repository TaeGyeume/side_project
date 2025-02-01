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

// ✅ 자동완성 검색 API
exports.autocompleteSearch = async (req, res) => {
  try {
    const {query} = req.query;
    const results = await accommodationService.autocompleteSearch(query);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({message: '자동완성 검색 중 오류 발생', error: error.message});
  }
};

// ✅ 날짜 및 인원수에 맞는 숙소 검색 API
exports.getAccommodationsBySearch = async (req, res) => {
  try {
    const {city, startDate, endDate, adults, minPrice, maxPrice, category, sortBy} =
      req.query;

    if (!city || !startDate || !endDate || !adults) {
      return res
        .status(400)
        .json({message: '검색 조건(city, startDate, endDate, adults)을 입력해주세요.'});
    }

    const accommodations = await accommodationService.getAccommodationsBySearch({
      city,
      startDate,
      endDate,
      adults,
      minPrice,
      maxPrice,
      category,
      sortBy
    });

    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({message: '숙소 검색 중 오류 발생', error: error.message});
  }
};

// ✅ 특정 숙소의 검색 조건에 맞는 객실 조회 API
exports.getAvailableRoomsByAccommodation = async (req, res) => {
  try {
    const {accommodationId} = req.params;
    const {startDate, endDate, adults, minPrice, maxPrice} = req.query;

    if (!startDate || !endDate || !adults) {
      return res.status(400).json({
        message: '검색 조건(startDate, endDate, adults)은 필수입니다.'
      });
    }

    const result = await accommodationService.getAvailableRoomsByAccommodation({
      accommodationId,
      startDate,
      endDate,
      adults: parseInt(adults),
      minPrice: parseInt(minPrice) || 0,
      maxPrice: parseInt(maxPrice) || 500000
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({message: '객실 검색 중 오류 발생', error: error.message});
  }
};

// ✅ 숙소 업데이트 컨트롤러
exports.updateAccommodation = async (req, res) => {
  try {
    const {accommodationId} = req.params;
    const updateData = req.body;

    const updatedAccommodation = await accommodationService.updateAccommodation(
      accommodationId,
      updateData
    );

    res.status(200).json({
      message: '숙소가 성공적으로 업데이트되었습니다.',
      accommodation: updatedAccommodation
    });
  } catch (error) {
    res.status(500).json({
      message: '숙소 업데이트 중 오류 발생',
      error: error.message
    });
  }
};

// ✅ 숙소 삭제 API 컨트롤러
exports.deleteAccommodation = async (req, res) => {
  try {
    const {accommodationId} = req.params;

    const result = await accommodationService.deleteAccommodation(accommodationId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({message: '숙소 삭제 중 오류 발생', error: error.message});
  }
};

exports.getAllAccommodations = async (req, res) => {
  try {
    const accommodations = await accommodationService.getAllAccommodations();
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};