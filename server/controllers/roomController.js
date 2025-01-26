const roomService = require("../services/roomService");

// ✅ 객실 생성 컨트롤러
const createRoom = async (req, res) => {
    try {
        const roomData = req.body;
        const newRoom = await roomService.createRoom(roomData);
        res.status(201).json({ message: "객실이 성공적으로 생성되었습니다.", room: newRoom });
    } catch (error) {
        res.status(500).json({ message: "객실 생성 중 오류 발생", error: error.message });
    }
};

module.exports = {
    createRoom
};
