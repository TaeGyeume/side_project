const accommodationService = require("../services/accommodationService");

// ✅ 숙소 생성 컨트롤러
const createAccommodation = async (req, res) => {
    try {
        const accommodationData = req.body;
        const newAccommodation = await accommodationService.createAccommodation(accommodationData);
        res.status(201).json({ message: "숙소가 성공적으로 생성되었습니다.", accommodation: newAccommodation });
    } catch (error) {
        res.status(500).json({ message: "숙소 생성 중 오류 발생", error: error.message });
    }
};

module.exports = {
    createAccommodation
};
