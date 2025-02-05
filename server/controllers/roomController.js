const roomService = require('../services/roomService');

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
