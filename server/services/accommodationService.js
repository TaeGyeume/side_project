// const mongoose = require('mongoose');
const Accommodation = require('../models/Accommodation');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Location = require('../models/Location');

// ✅ 숙소 생성 함수
exports.createAccommodation = async accommodationData => {
  try {
    const newAccommodation = new Accommodation(accommodationData);
    await newAccommodation.save();
    return newAccommodation;
  } catch (error) {
    throw new Error('숙소 생성 중 오류 발생: ' + error.message);
  }
};

// ✅ 실시간 자동완성 검색 함수
exports.autocompleteSearch = async query => {
  try {
    if (!query) return {locations: [], accommodations: []};

    // 🔹 공백 제거 및 정규식 변환 (띄어쓰기 무시)
    const normalizedQuery = query.replace(/\s+/g, ''); // 모든 공백 제거
    const regex = new RegExp(normalizedQuery.split('').join('.*'), 'i'); // 띄어쓰기 없는 검색

    // 1️⃣ **도시(Location) 검색 (`text index` & `regex`)**
    let locations = await Location.find(
      {$text: {$search: query}}, // MongoDB Full-Text Search
      {score: {$meta: 'textScore'}} // 검색 관련성 점수 추가
    )
      .sort({score: {$meta: 'textScore'}}) // 관련성 높은 순 정렬
      .limit(10);

    // 🔹 `text index` 결과가 없으면 정규식 검색으로 대체
    let regexLocations = await Location.find({name: {$regex: regex}}).limit(10);

    // 🔹 두 검색 결과를 합치고 중복 제거
    locations = [...locations, ...regexLocations].filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    // 2️⃣ **숙소(Accommodation) 검색 (`text index` & `regex`)**
    let accommodations = await Accommodation.find(
      {$text: {$search: query}}, // Full-Text Search 적용
      {score: {$meta: 'textScore'}}
    )
      .sort({score: {$meta: 'textScore'}}) // 검색 관련성 순 정렬
      .limit(10);

    // 🔹 `text index` 결과가 없으면 정규식 검색으로 대체
    let regexAccommodations = await Accommodation.find({name: {$regex: regex}})
      .select('name coordinates description images')
      .populate('location', 'name country')
      .limit(10);

    // 🔹 두 검색 결과를 합치고 중복 제거
    accommodations = [...accommodations, ...regexAccommodations].filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    return {locations, accommodations};
  } catch (error) {
    throw new Error('자동완성 검색 중 오류 발생: ' + error.message);
  }
};

// ✅ 숙소 검색 함수 (50만원 이상 필터링 가능)
exports.getAccommodationsBySearch = async ({
  city,
  startDate,
  endDate,
  adults,
  minPrice = 0,
  maxPrice = 500000,
  category = 'all',
  sortBy = 'default'
}) => {
  try {
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);

    // 🔹 **검색어 전처리 (띄어쓰기 제거 및 정규식 변환)**
    const normalizedCity = city.replace(/\s+/g, ''); // 공백 제거
    const regexCity = new RegExp(normalizedCity.split('').join('.*'), 'i'); // 띄어쓰기 무시

    // 1️⃣ **도시 검색 (`text index` & `regex`)**
    let locations = await Location.find(
      {$text: {$search: city}},
      {score: {$meta: 'textScore'}}
    )
      .sort({score: {$meta: 'textScore'}})
      .limit(10);

    let regexLocations = await Location.find({name: {$regex: regexCity}}).limit(10);

    locations = [...locations, ...regexLocations].filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    const locationIds = locations.map(loc => loc._id);

    // 2️⃣ **예약된 방 ID 조회**
    const bookedRooms = await Booking.find({
      type: 'accommodation',
      $or: [{startDate: {$lt: checkOutDate}, endDate: {$gt: checkInDate}}]
    }).distinct('roomId');

    // 3️⃣ **가격 필터 설정 (50만원 이상인 경우 최대 제한 없음)**
    const priceFilter =
      maxPrice >= 500000 ? {$gte: minPrice} : {$gte: minPrice, $lte: maxPrice};

    // 4️⃣ **객실 단위로 필터링 (가격 + 인원)**
    const availableRooms = await Room.find({
      maxGuests: {$gte: adults},
      _id: {$nin: bookedRooms},
      pricePerNight: priceFilter // ✅ 가격 필터 적용
    }).select('_id accommodation maxGuests pricePerNight');

    // ✅ 가격 필터링이 적용된 방의 ID 목록 생성
    const availableRoomIds = availableRooms.map(room => room._id);

    // 5️⃣ **사용 가능한 숙소 ID 리스트 생성**
    const availableAccommodationIds = [
      ...new Set(availableRooms.map(room => room.accommodation.toString()))
    ];

    // 6️⃣ **숙소 검색 (`text index` & `regex`)**
    let accommodations = await Accommodation.find(
      {
        $text: {$search: city},
        ...(category !== 'all' && {category}),
        _id: {$in: availableAccommodationIds} // ✅ 예약 가능한 숙소만 검색
      },
      {score: {$meta: 'textScore'}}
    )
      .sort({score: {$meta: 'textScore'}})
      .limit(10);

    let regexAccommodations = await Accommodation.find({
      $and: [
        {
          $or: [{location: {$in: locationIds}}, {name: {$regex: regexCity}}]
        },
        {_id: {$in: availableAccommodationIds}},
        ...(category !== 'all' ? [{category}] : [])
      ]
    }).limit(10);

    accommodations = [...accommodations, ...regexAccommodations].filter(
      (v, i, a) => a.findIndex(t => t._id.toString() === v._id.toString()) === i
    );

    // 7️⃣ **방이 없는 숙소 제거 및 가격 필터링된 방만 유지**
    accommodations = accommodations.filter(accommodation => {
      // ✅ 숙소 내에서 필터링된 방만 유지
      accommodation.rooms = availableRooms.filter(
        room => room.accommodation.toString() === accommodation._id.toString()
      );

      // ✅ 숙소의 `minPrice` 업데이트
      if (accommodation.rooms.length > 0) {
        accommodation.minPrice = Math.min(
          ...accommodation.rooms.map(r => r.pricePerNight)
        );
      }

      return accommodation.rooms.length > 0; // 방이 없는 숙소 제거
    });

    // 8️⃣ **정렬 적용 (검색 관련성 / 가격 / 평점)**
    if (sortBy === 'priceLow') {
      accommodations = accommodations.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'priceHigh') {
      accommodations = accommodations.sort((a, b) => b.minPrice - a.minPrice);
    } else if (sortBy === 'rating') {
      accommodations = accommodations.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'default') {
      accommodations = accommodations.sort((a, b) => b.score - a.score);
    }

    return accommodations;
  } catch (error) {
    console.error('❌ 숙소 검색 중 오류 발생:', error);
    throw new Error('숙소 검색 중 오류 발생: ' + error.message);
  }
};

// ✅ 특정 숙소의 검색 조건에 맞는 방 조회
exports.getAvailableRoomsByAccommodation = async ({
  accommodationId,
  startDate,
  endDate,
  adults,
  minPrice = 0, // 기본값: 0원
  maxPrice = 500000 // 기본값: 50만 원 이상
}) => {
  try {
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);

    // 1️⃣ **해당 숙소(Accommodation) 존재 여부 확인**
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      throw new Error('해당 숙소를 찾을 수 없습니다.');
    }

    // 2️⃣ **예약된 방 조회**
    const bookedRooms = await Booking.find({
      accommodation: accommodationId,
      $or: [{startDate: {$lt: checkOutDate}, endDate: {$gt: checkInDate}}]
    }).distinct('roomId');

    // 3️⃣ **검색 조건에 맞는 객실 조회**
    const priceFilter =
      maxPrice >= 500000 ? {$gte: minPrice} : {$gte: minPrice, $lte: maxPrice};

    const availableRooms = await Room.find({
      accommodation: accommodationId, // 특정 숙소 ID 필터
      maxGuests: {$gte: adults}, // 최소 인원 조건 충족
      _id: {$nin: bookedRooms}, // 예약된 방 제외
      pricePerNight: priceFilter // 가격 필터 적용
    }).select('name pricePerNight images maxGuests amenities');

    return {accommodation, availableRooms};
  } catch (error) {
    console.error('❌ 특정 숙소의 객실 검색 중 오류 발생:', error);
    throw new Error('객실 검색 중 오류 발생: ' + error.message);
  }
};

// ✅ 숙소 업데이트 함수 (가격 업데이트 제거)
exports.updateAccommodation = async (accommodationId, updateData) => {
  try {
    // 1️⃣ 숙소 존재 여부 확인
    const existingAccommodation = await Accommodation.findById(accommodationId);
    if (!existingAccommodation) {
      throw new Error('숙소를 찾을 수 없습니다.');
    }

    // 3️⃣ 숙소 업데이트 실행
    const updatedAccommodation = await Accommodation.findByIdAndUpdate(
      accommodationId,
      updateData,
      {new: true} // 업데이트 후 변경된 데이터 반환
    );

    return updatedAccommodation;
  } catch (error) {
    throw new Error('숙소 업데이트 중 오류 발생: ' + error.message);
  }
};

// ✅ 숙소 삭제 함수
exports.deleteAccommodation = async accommodationId => {
  try {
    // 1️⃣ 숙소 존재 여부 확인
    const existingAccommodation = await Accommodation.findById(accommodationId);
    if (!existingAccommodation) {
      throw new Error('숙소를 찾을 수 없습니다.');
    }

    // 2️⃣ 해당 숙소에 속한 모든 방 삭제
    await Room.deleteMany({accommodation: accommodationId});

    // 3️⃣ 숙소 삭제
    await Accommodation.findByIdAndDelete(accommodationId);

    return {message: '숙소 및 해당 숙소의 모든 방이 삭제되었습니다.'};
  } catch (error) {
    throw new Error('숙소 삭제 중 오류 발생: ' + error.message);
  }
};

exports.getAllAccommodations = async () => {
  try {
    return await Accommodation.find().populate('rooms'); // 숙소와 관련된 방 정보도 가져오기
  } catch (error) {
    throw new Error('숙소 목록을 불러오는 중 오류 발생: ' + error.message);
  }
};