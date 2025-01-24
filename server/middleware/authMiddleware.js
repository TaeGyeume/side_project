const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // 쿠키에서 accessToken 가져오기
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "액세스 토큰이 필요합니다." });
    }

    try {
        // 토큰 검증
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;  // 요청 객체에 사용자 정보 추가
        next();  // 다음 미들웨어로 이동
    } catch (error) {
        return res.status(401).json({ message: "유효하지 않은 토큰입니다. 다시 로그인해주세요." });
    }
};

module.exports = authMiddleware;
