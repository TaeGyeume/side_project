const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // 요청 헤더에서 토큰 가져오기
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "인증 토큰이 필요합니다." });
    }

    try {
        // Bearer 부분 제거
        const decodedToken = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decodedToken; // 요청 객체에 사용자 정보 추가
        next(); // 다음 미들웨어 호출
    } catch (error) {
        res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }
};

module.exports = authMiddleware;
