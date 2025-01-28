const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// 객실 추가 API (POST /api/rooms)
router.post('/', roomController.createRoom);
// 객실 업데이트 (PATCH /api/rooms/:roomId)
router.patch('/:roomId', roomController.updateRoom);
// 객실 삭제 (DELETE /api/rooms/:roomId)
router.delete('/:roomId', roomController.deleteRoom);

module.exports = router;
