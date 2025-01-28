const mongoose = require('mongoose');
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

    // 1️⃣ `text index` 검색 (우선 적용)
    let locations = await Location.find(
      {$text: {$search: query}},
      {score: {$meta: 'textScore'}} // 검색 관련성 점수 추가
    )
      .sort({score: {$meta: 'textScore'}}) // 검색 관련성이 높은 순으로 정렬
      .limit(10);

    // 2️⃣ `text index` 검색 결과가 없을 경우 `$regex` 사용
    if (locations.length === 0) {
      locations = await Location.find({name: new RegExp(query, 'i')}).limit(10);
    }

    // 3️⃣ 숙소(Accommodation) 검색
    const accommodations = await Accommodation.find(
      {name: new RegExp(query, 'i')} // 부분 검색 (대소문자 구분 없음)
    )
      .select('name coordinates')
      .populate('location', 'name country')
      .limit(10);

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
  minPrice = 0, // 기본값: 0원
  maxPrice = 500000, // 기본값: 500,000원 이상
  category = 'all', // 기본값: all
  sortBy = 'default' // 기본값: 기본순 (평점 높은 순)
}) => {
  try {
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);

    // 1️⃣ 해당 도시(Location)의 ObjectId 가져오기
    const location = await Location.findOne({name: city});
    if (!location) return [];
    const locationId = location._id;

    // 2️⃣ 예약된 방 ID 조회
    const bookedRooms = await Booking.find({
      type: 'accommodation',
      $or: [{startDate: {$lt: checkOutDate}, endDate: {$gt: checkInDate}}]
    }).distinct('roomId');

    // 3️⃣ **가격 필터 설정 (50만원 이상인 경우 최대 제한 없음)**
    const priceFilter =
      maxPrice >= 500000 ? {$gte: minPrice} : {$gte: minPrice, $lte: maxPrice};

    // 4️⃣ **객실 단위로 필터링 (가격 + 인원)**
    const availableRooms = await Room.find({
      maxGuests: {$gte: adults}, // 최소 인원 충족하는 방만 선택
      _id: {$nin: bookedRooms}, // 예약된 방 제외
      pricePerNight: priceFilter // 가격 필터링 수정됨
    }).select('_id accommodation maxGuests pricePerNight');

    // 5️⃣ **사용 가능한 숙소 ID 리스트 생성**
    const availableAccommodationIds = [
      ...new Set(availableRooms.map(room => room.accommodation.toString()))
    ];

    // 6️⃣ **특정 도시(Location)에 속한 숙소만 조회**
    let filter = {location: locationId, _id: {$in: availableAccommodationIds}};
    if (category && category !== 'all') filter.category = category; // 특정 숙소 유형만 필터링

    let accommodations = await Accommodation.find(filter).populate({
      path: 'rooms',
      match: {maxGuests: {$gte: adults}, pricePerNight: priceFilter}, // 방 필터 적용
      select: 'name pricePerNight images maxGuests'
    });

    // 7️⃣ **방이 없는 숙소 제거**
    accommodations = accommodations.filter(
      accommodation => accommodation.rooms.length > 0
    );

    // 8️⃣ **정렬 적용 (기본순 / 가격순)**
    if (sortBy === 'priceLow') {
      accommodations = accommodations.sort((a, b) => {
        const aMinPrice = Math.min(...a.rooms.map(r => r.pricePerNight));
        const bMinPrice = Math.min(...b.rooms.map(r => r.pricePerNight));
        return aMinPrice - bMinPrice;
      });
    } else if (sortBy === 'priceHigh') {
      accommodations = accommodations.sort((a, b) => {
        const aMaxPrice = Math.max(...a.rooms.map(r => r.pricePerNight));
        const bMaxPrice = Math.max(...b.rooms.map(r => r.pricePerNight));
        return bMaxPrice - aMaxPrice;
      });
    }
    // 기본순 정렬: 평점 높은 순
    else if (sortBy === 'default') {
      accommodations = accommodations.sort((a, b) => b.rating - a.rating);
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
