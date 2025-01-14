const jwt = require("jsonwebtoken");
require("dotenv").config({ path: __dirname + "/.env" }); // .env 파일이 server 디렉토리에 있는 경우

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token); // 토큰 로그

    if (!token) {
        console.error("No token provided"); // 로그 추가
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        // JWT_SECRET가 환경변수에 존재하지 않으면 오류 메시지
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET environment variable is not defined!");
            return res.status(500).json({ message: "Internal Server Error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT payload:", decoded); // 디코딩된 토큰 정보 로그

        req.user = decoded; // 토큰 디코딩 결과 (예: { userId: '...', iat: ..., exp: ... })
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message); // 오류 메시지 구체화
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
