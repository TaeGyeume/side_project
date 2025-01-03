const User = require("../models/User");

// 사용자 생성
exports.createUser = async (req, res) => {
    try {
        console.log("Request body:", req.body); // 요청 데이터 출력
        const user = new User(req.body);
        await user.save();
        console.log("New user created:", user); // 생성된 사용자 정보 출력
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error("Error creating user:", error.message); // 오류 메시지 출력
        res.status(400).json({ message: "Error creating user", error });
    }
};

// 사용자 목록 조회
exports.getUsers = async (req, res) => {
    try {
        console.log("Fetching all users..."); // 사용자 조회 시도 로그
        const users = await User.find();
        console.log("Fetched users:", users); // 조회된 사용자 정보 출력
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message); // 오류 메시지 출력
        res.status(500).json({ message: "Error fetching users", error });
    }
};
