const roomService = require('../services/roomService');
const Room = require('../models/Room'); // Room 모델 불러오기
const path = require('path');
const fs = require('fs');

// ✅ 객실 생성 컨트롤러 (이미지 업로드 지원)
exports.createRoom = async (req, res) => {
  try {
    const roomData = req.body;
    const imageFiles = req.files; // 🔥 파일 가져오기

    // **🔥 amenities가 문자열이면 배열로 변환**
    if (typeof roomData.amenities === 'string') {
      try {
        roomData.amenities = JSON.parse(roomData.amenities);
      } catch (error) {
        return res.status(400).json({
          message: 'amenities 필드는 JSON 형식의 배열이어야 합니다.'
        });
      }
    }

    const newRoom = await roomService.createRoom(roomData, imageFiles);
    res.status(201).json({message: '객실이 성공적으로 생성되었습니다.', room: newRoom});
  } catch (error) {
    res.status(500).json({message: '객실 생성 중 오류 발생', error: error.message});
  }
};

// ✅ 객실 업데이트 컨트롤러 (이미지 업로드 지원)
exports.updateRoom = async (req, res) => {
  try {
    const {roomId} = req.params; // URL에서 객실 ID 추출
    const updatedData = req.body; // 요청 데이터
    const imageFiles = req.files; // 🔥 파일 가져오기

    // 🔥 amenities가 문자열이면 배열로 변환
    if (typeof updatedData.amenities === 'string') {
      try {
        updatedData.amenities = JSON.parse(updatedData.amenities);
      } catch (error) {
        return res.status(400).json({
          message: 'amenities 필드는 JSON 형식의 배열이어야 합니다.'
        });
      }
    }

    const updatedRoom = await roomService.updateRoom(roomId, updatedData, imageFiles);

    res.status(200).json({
      message: '객실이 성공적으로 업데이트되었습니다.',
      room: updatedRoom
    });
  } catch (error) {
    res.status(500).json({
      message: '객실 업데이트 중 오류 발생',
      error: error.message
    });
  }
};

// ✅ 객실 삭제 컨트롤러
exports.deleteRoom = async (req, res) => {
  try {
    const {roomId} = req.params;

    const result = await roomService.deleteRoom(roomId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: '객실 삭제 중 오류 발생',
      error: error.message
    });
  }
};

exports.deleteRoomImage = async (req, res) => {
  const {roomId} = req.params;
  const {imageUrl} = req.body; // 요청 바디에서 imageUrl 가져오기

  const result = await roomService.deleteImage(roomId, imageUrl);

  return res
    .status(result.status)
    .json({message: result.message, images: result.images || []});
};

exports.getRoomById = async (req, res) => {
  try {
    const {roomId} = req.params;
    const room = await roomService.getRoomById(roomId);
    res.status(200).json(room);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
};

// ✅ 개별 객실 이미지 삭제 API (디버깅 추가)
exports.deleteRoomImage = async (req, res) => {
  try {
    const {roomId} = req.params;
    console.log('📌 DELETE 요청에서 받은 roomId:', roomId);
    console.log('📌 DELETE 요청에서 받은 body:', req.body);

    let deletedImages = req.body.deletedImages;

    // ✅ deletedImages가 undefined인지 확인
    if (!deletedImages) {
      console.log('❌ 삭제할 이미지 목록이 없습니다.');
      return res.status(400).json({message: '삭제할 이미지 목록이 없습니다.'});
    }

    // ✅ JSON 변환 확인
    if (typeof deletedImages === 'string') {
      try {
        deletedImages = JSON.parse(deletedImages);
      } catch (error) {
        console.log('❌ JSON 변환 실패:', error);
        return res.status(400).json({message: '올바른 JSON 형식이 아닙니다.'});
      }
    }

    console.log('🚀 서버에서 받은 삭제할 이미지 목록:', deletedImages);

    if (!Array.isArray(deletedImages) || deletedImages.length === 0) {
      console.log('❌ 삭제할 이미지 목록이 비어 있습니다.');
      return res.status(400).json({message: '삭제할 이미지가 없습니다.'});
    }

    // ✅ 해당 객실 찾기
    const room = await Room.findById(roomId);
    if (!room) {
      console.log('❌ 해당 roomId의 객실을 찾을 수 없음:', roomId);
      return res.status(404).json({message: '객실을 찾을 수 없습니다.'});
    }

    console.log('✅ 객실 찾기 성공:', room);

    // ✅ 기존 이미지 목록 확인
    console.log('📌 현재 객실의 이미지 목록:', room.images);

    // ✅ 삭제할 이미지가 객실에 존재하는지 확인
    const imagesToRemove = deletedImages.filter(img => room.images.includes(img));
    if (imagesToRemove.length === 0) {
      console.log('❌ 삭제할 이미지가 객실에 존재하지 않음:', deletedImages);
      return res
        .status(404)
        .json({message: '해당 이미지는 객실에 등록되어 있지 않습니다.'});
    }

    console.log('🗑️ 삭제할 이미지 목록:', imagesToRemove);

    // ✅ DB에서 이미지 제거
    room.images = room.images.filter(img => !deletedImages.includes(img));
    await room.save();

    console.log('✅ DB에서 이미지 삭제 완료. 남은 이미지 목록:', room.images);

    // ✅ 서버에서 실제 이미지 파일 삭제
    imagesToRemove.forEach(imagePath => {
      if (!imagePath) {
        console.warn('⚠️ 잘못된 이미지 경로가 감지됨:', imagePath);
        return;
      }

      const absoluteFilePath = path.join(
        __dirname,
        '../uploads',
        imagePath.replace('/uploads/', '')
      );
      console.log('🗑️ 삭제할 파일 경로:', absoluteFilePath);

      if (fs.existsSync(absoluteFilePath)) {
        fs.unlink(absoluteFilePath, err => {
          if (err) console.error('❌ 이미지 삭제 오류:', err);
          else console.log('✅ 이미지 삭제 성공:', absoluteFilePath);
        });
      } else {
        console.warn('⚠️ 삭제할 이미지 파일이 존재하지 않음:', absoluteFilePath);
      }
    });

    return res
      .status(200)
      .json({message: '이미지가 삭제되었습니다.', images: room.images});
  } catch (error) {
    console.error('🔥 이미지 삭제 오류:', error);
    return res.status(500).json({message: '서버 오류로 인해 이미지 삭제 실패'});
  }
};
