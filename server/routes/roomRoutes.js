const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const upload = require('../middleware/uploadMiddleware');

// 객실 추가 API (POST /api/rooms)
router.post('/', upload, roomController.createRoom);
// 객실 업데이트 (PATCH /api/rooms/:roomId)
router.patch('/:roomId', upload, roomController.updateRoom);
// 객실 삭제 (DELETE /api/rooms/:roomId)
router.delete('/:roomId', roomController.deleteRoom);
// ✅ 객실 이미지 삭제 API (DELETE)
router.post('/:roomId/images/delete', roomController.deleteRoomImage);
// ✅ 특정 객실 조회 (GET /api/rooms/:roomId)
router.get('/:roomId', roomController.getRoomById);

module.exports = router;
