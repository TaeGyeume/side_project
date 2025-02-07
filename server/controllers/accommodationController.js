const accommodationService = require('../services/accommodationService');

exports.createAccommodation = async (req, res) => {
  try {
    const accommodationData = req.body;

    // 🔹 coordinates가 문자열로 전달되므로 JSON 변환
    if (accommodationData.coordinates) {
      try {
        accommodationData.coordinates = JSON.parse(accommodationData.coordinates);
      } catch (error) {
        return res.status(400).json({message: 'Invalid coordinates format'});
      }
    }

    // 🔹 amenities도 문자열로 전달될 경우 배열로 변환
    if (accommodationData.amenities) {
      try {
        accommodationData.amenities = JSON.parse(accommodationData.amenities);
      } catch (error) {
        return res.status(400).json({message: 'Invalid amenities format'});
      }
    }

    // 업로드된 파일이 있는 경우, 파일 경로 리스트 생성
    const imagePaths = req.files
      ? req.files.map(file => `/uploads/${file.filename}`)
      : [];
    accommodationData.images = imagePaths;

    const newAccommodation = await accommodationService.createAccommodation(
      accommodationData
    );

    res.status(201).json({
      message: '숙소가 성공적으로 생성되었습니다.',
      accommodation: newAccommodation
    });
  } catch (error) {
    res.status(500).json({
      message: '숙소 생성 중 오류 발생',
      error: error.message
    });
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
    let {startDate, endDate, adults, minPrice, maxPrice} = req.query;

    // 👉 `startDate`, `endDate`, `adults` 값이 없으면 undefined로 처리 (서비스에서 모든 객실 반환하도록)
    startDate = startDate ? startDate : undefined;
    endDate = endDate ? endDate : undefined;
    adults = adults ? parseInt(adults) : undefined;

    const result = await accommodationService.getAvailableRoomsByAccommodation({
      accommodationId,
      startDate,
      endDate,
      adults,
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
    const imageFiles = req.files; // multer가 처리한 업로드된 파일들

    const updatedAccommodation = await accommodationService.updateAccommodation(
      accommodationId,
      updateData,
      imageFiles
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
    const {page = 1, limit = 6} = req.query; // 기본 페이지 1, 기본 개수 6개
    const accommodationsData = await accommodationService.getAllAccommodations(
      page,
      limit
    );

    res.json(accommodationsData);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

// ✅ 숙소 이름으로 검색하는 컨트롤러
exports.searchAccommodationsByName = async (req, res) => {
  try {
    const {name} = req.query;
    console.log('🔍 검색어:', name);
    if (!name) {
      return res.status(400).json({message: '검색할 숙소 이름을 입력해주세요.'});
    }

    console.log('✅ 검색 요청 수행');
    const accommodations = await accommodationService.getAccommodationsByName(name);
    console.log('✅ 검색 결과:', accommodations);
    res.status(200).json(accommodations);
  } catch (error) {
    res.status(500).json({message: '숙소 이름 검색 중 오류 발생', error: error.message});
  }
};

exports.getAccommodationById = async (req, res) => {
  try {
    const {accommodationId} = req.params;
    console.log('숙소 ID 조회 요청:', accommodationId);

    const accommodation = await accommodationService.getAccommodationById(
      accommodationId
    );

    res.status(200).json(accommodation);
  } catch (error) {
    console.error('❌ 숙소 조회 오류:', error.message);
    res.status(404).json({message: error.message});
  }
};

exports.deleteAccommodationImage = async (req, res) => {
  const {accommodationId} = req.params;
  const {imageUrl} = req.body;

  const result = await accommodationService.deleteImage(accommodationId, imageUrl);

  return res
    .status(result.status)
    .json({message: result.message, images: result.images || []});
};
