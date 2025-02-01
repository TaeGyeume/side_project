const Room = require('../models/Room');
const Accommodation = require('../models/Accommodation');

// ✅ 객실 추가 함수
exports.createRoom = async roomData => {
  try {
    const {accommodation} = roomData;

    // 숙소가 존재하는지 확인
    const existingAccommodation = await Accommodation.findById(accommodation);
    if (!existingAccommodation) {
      throw new Error('숙소를 찾을 수 없습니다.');
    }

    // 새로운 객실 생성 및 저장
    const newRoom = new Room(roomData);
    await newRoom.save();

    // 숙소의 minPrice, maxPrice 업데이트
    await exports.updateAccommodationPriceRange(accommodation);

    // 숙소에 객실 추가 (객실 ID를 rooms 배열에 추가)
    await Accommodation.findByIdAndUpdate(accommodation, {
      $push: {rooms: newRoom._id}
    });

    return newRoom;
  } catch (error) {
    throw new Error('객실 생성 중 오류 발생: ' + error.message);
  }
};

// ✅ 객실 업데이트 함수
exports.updateRoom = async (roomId, updatedData) => {
  try {
    // 기존 객실 정보 가져오기
    const existingRoom = await Room.findById(roomId);
    if (!existingRoom) {
      throw new Error('객실을 찾을 수 없습니다.');
    }

    // 객실 업데이트
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updatedData, {
      new: true, // 업데이트된 문서 반환
      runValidators: true // 유효성 검사
    });

    // 숙소의 minPrice, maxPrice 업데이트
    if (updatedRoom.pricePerNight !== existingRoom.pricePerNight) {
      await exports.updateAccommodationPriceRange(updatedRoom.accommodation);
    }

    return updatedRoom;
  } catch (error) {
    throw new Error('객실 업데이트 중 오류 발생: ' + error.message);
  }
};

// ✅ 객실 삭제 함수
exports.deleteRoom = async roomId => {
  try {
    // 1️⃣ 삭제할 객실 찾기
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('객실을 찾을 수 없습니다.');
    }

    const accommodationId = room.accommodation;

    // 2️⃣ 객실 삭제
    await Room.findByIdAndDelete(roomId);

    // 3️⃣ 숙소에서 객실 ID 제거
    await Accommodation.findByIdAndUpdate(accommodationId, {
      $pull: {rooms: roomId}
    });

    // 4️⃣ 숙소의 minPrice, maxPrice 업데이트
    await exports.updateAccommodationPriceRange(accommodationId);

    return {message: '객실이 성공적으로 삭제되었습니다.'};
  } catch (error) {
    throw new Error('객실 삭제 중 오류 발생: ' + error.message);
  }
};

// ✅ 숙소의 minPrice, maxPrice 업데이트 함수
exports.updateAccommodationPriceRange = async accommodationId => {
  try {
    const rooms = await Room.find({accommodation: accommodationId});

    if (rooms.length > 0) {
      const minPrice = Math.min(...rooms.map(room => room.pricePerNight));
      const maxPrice = Math.max(...rooms.map(room => room.pricePerNight));

      await Accommodation.findByIdAndUpdate(accommodationId, {minPrice, maxPrice});
    } else {
      // 객실이 없다면 가격 초기화
      await Accommodation.findByIdAndUpdate(accommodationId, {minPrice: 0, maxPrice: 0});
    }
  } catch (error) {
    throw new Error('숙소 가격 업데이트 중 오류 발생: ' + error.message);
  }
};
