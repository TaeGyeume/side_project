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

// ✅ 실시간 자동완성 검색 API (최적화된 버전)
exports.autocompleteSearch = async query => {
  try {
    if (!query) return { locations: [], accommodations: [] };

    // 🔍 1️⃣ `text index` 검색 (우선 적용)
    let locations = await Location.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } } // 검색 관련성 점수 추가
    ).sort({ score: { $meta: "textScore" } }) // 검색 관련성이 높은 순으로 정렬
      .limit(10);

    // 🔍 2️⃣ `text index` 검색 결과가 없을 경우 `$regex` 사용
    if (locations.length === 0) {
      locations = await Location.find({ name: new RegExp(query, "i") }).limit(10);
    }

    // 🔍 3️⃣ 숙소(Accommodation) 검색
    const accommodations = await Accommodation.find(
      { name: new RegExp(query, "i") } // 부분 검색 (대소문자 구분 없음)
    )
      .select("name coordinates")
      .populate("location", "name country")
      .limit(10);

    return { locations, accommodations };
  } catch (error) {
    throw new Error("자동완성 검색 중 오류 발생: " + error.message);
  }
};

// ✅ 숙소 검색 함수
exports.getAccommodationsBySearch = async ({ city, startDate, endDate, adults }) => {
  try {
    const checkInDate = new Date(startDate);
    const checkOutDate = new Date(endDate);

    // 1️⃣ 해당 도시(Location)의 ObjectId 가져오기
    const location = await Location.findOne({ name: city });
    if (!location) return []; // 도시가 존재하지 않으면 빈 배열 반환
    const locationId = location._id;

    // 2️⃣ 예약된 방 ID 조회
    const bookedRooms = await Booking.find({
      type: "accommodation",
      $or: [{ startDate: { $lt: checkOutDate }, endDate: { $gt: checkInDate } }]
    }).distinct("roomId");

    // 3️⃣ 예약이 가능하며 최소 인원을 충족하는 방 조회
    const availableRooms = await Room.find({
      maxGuests: { $gte: adults },
      _id: { $nin: bookedRooms }
    }).select("accommodation");

    // 4️⃣ 사용 가능한 숙소 ID 리스트 생성
    const availableAccommodationIds = [...new Set(availableRooms.map(room => room.accommodation))];

    // 5️⃣ 특정 도시(Location)에 속한 숙소 + 예약 가능한 숙소만 조회
    const accommodations = await Accommodation.find({
      location: locationId,
      _id: { $in: availableAccommodationIds }
    }).populate("location rooms");

    return accommodations;
  } catch (error) {
    console.error("❌ 숙소 검색 중 오류 발생:", error);
    throw new Error("숙소 검색 중 오류 발생: " + error.message);
  }
};