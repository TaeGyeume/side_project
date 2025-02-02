const Location = require('../models/Location');

// ✅ 여행지 추가 함수
exports.createLocation = async locationData => {
  try {
    const newLocation = new Location(locationData);
    await newLocation.save();
    return newLocation;
  } catch (error) {
    throw new Error('여행지 추가 중 오류 발생: ' + error.message);
  }
};

// ✅ 모든 여행지 조회 서비스
exports.getLocations = async () => {
  return await Location.find();
};

// ✅ 도시 및 국가 검색 함수 (한 글자 입력 시도 가능)
exports.searchLocations = async query => {
  try {
    if (!query) return [];

    // `text index` 검색 (두 글자 이상일 때만 사용)
    let locations = [];
    if (query.length > 1) {
      locations = await Location.find(
        {$text: {$search: query}},
        {score: {$meta: 'textScore'}}
      )
        .sort({score: {$meta: 'textScore'}}) // 검색 관련성이 높은 순으로 정렬
        .limit(10);
    }

    // `text index` 검색 결과가 없거나 한 글자인 경우 `$regex` 사용
    if (locations.length === 0) {
      locations = await Location.find({
        $or: [
          {name: {$regex: query, $options: 'i'}}, // 도시 검색 (대소문자 구분 없이)
          {country: {$regex: query, $options: 'i'}} // 국가 검색 (대소문자 구분 없이)
        ]
      }).limit(10);
    }

    return locations;
  } catch (error) {
    throw new Error('도시/국가 검색 중 오류 발생: ' + error.message);
  }
};

// ✅ 국가 목록 조회
exports.getCountries = async () => {
  try {
    const countries = await Location.distinct('country'); // 중복 제거하여 국가 목록 반환
    return countries;
  } catch (error) {
    throw new Error('국가 목록 조회 중 오류 발생: ' + error.message);
  }
};

// ✅ 특정 국가의 도시 목록 조회
exports.getCitiesByCountry = async (country) => {
  try {
    if (!country) {
      throw new Error('국가명을 입력해주세요.');
    }

    const cities = await Location.find({ country }).select('_id name');
    return cities;
  } catch (error) {
    throw new Error('도시 목록 조회 중 오류 발생: ' + error.message);
  }
};