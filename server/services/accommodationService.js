const Accommodation = require("../models/Accommodation"); // 숙소 모델 불러오기

// ✅ 숙소 생성 함수
const createAccommodation = async (accommodationData) => {
    try {
        const newAccommodation = new Accommodation(accommodationData);
        await newAccommodation.save();
        return newAccommodation;
    } catch (error) {
        throw new Error("숙소 생성 중 오류 발생: " + error.message);
    }
};

module.exports = {
    createAccommodation
};
