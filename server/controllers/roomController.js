const roomService = require('../services/roomService');

// ✅ 객실 생성 컨트롤러
exports.createRoom = async (req, res) => {
  try {
    const roomData = req.body;
    const newRoom = await roomService.createRoom(roomData);
    res.status(201).json({message: '객실이 성공적으로 생성되었습니다.', room: newRoom});
  } catch (error) {
    res.status(500).json({message: '객실 생성 중 오류 발생', error: error.message});
  }
};

// ✅ 객실 업데이트 컨트롤러
exports.updateRoom = async (req, res) => {
  try {
    const {roomId} = req.params; // URL에서 객실 ID 추출
    const updatedData = req.body; // 요청 데이터

    const updatedRoom = await roomService.updateRoom(roomId, updatedData);
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
