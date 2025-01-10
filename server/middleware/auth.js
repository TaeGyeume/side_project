const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Received token:", token);
    if (!token) {
        console.error("No token provided"); // 로그 추가
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded JWT payload:", decoded); // 디코딩된 토큰 정보 로그
        req.user = decoded; // 토큰 디코딩 결과, 예: { id: '...', iat: ..., exp: ... }
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
