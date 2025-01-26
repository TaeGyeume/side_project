const Room = require('../models/Room');
const Accommodation = require('../models/Accommodation');

// ✅ 객실 추가 함수
const createRoom = async roomData => {
  try {
    const {accommodation, pricePerNight} = roomData;

    // 숙소가 존재하는지 확인
    const existingAccommodation = await Accommodation.findById(accommodation);
    if (!existingAccommodation) {
      throw new Error('숙소를 찾을 수 없습니다.');
    }

    // 새로운 객실 생성 및 저장
    const newRoom = new Room(roomData);
    await newRoom.save();

    // ✅ 숙소의 minPrice, maxPrice 업데이트
    await updateAccommodationPriceRange(accommodation);

    return newRoom;
  } catch (error) {
    throw new Error('객실 생성 중 오류 발생: ' + error.message);
  }
};

// ✅ 숙소의 minPrice, maxPrice 업데이트 함수
const updateAccommodationPriceRange = async accommodationId => {
  const rooms = await Room.find({accommodation: accommodationId});

  if (rooms.length > 0) {
    const minPrice = Math.min(...rooms.map(room => room.pricePerNight));
    const maxPrice = Math.max(...rooms.map(room => room.pricePerNight));

    await Accommodation.findByIdAndUpdate(accommodationId, {minPrice, maxPrice});
  } else {
    // 객실이 없다면 가격 초기화
    await Accommodation.findByIdAndUpdate(accommodationId, {minPrice: 0, maxPrice: 0});
  }
};

module.exports = {
  createRoom,
  updateAccommodationPriceRange
};
