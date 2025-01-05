const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// JWT 생성
const generateToken = (user) => {
  const payload = { id: user._id };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 회원가입
exports.register = async (req, res) => {
    try {
        const { username, name, email, password, phone, gender, birthdate } = req.body;
        console.log("Register request body:", req.body); // 요청 데이터 로그
        if (!username || !email || !password || !phone || !gender || !birthdate) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, name, email, password: hashedPassword, phone, gender, birthdate });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Register error:", error); // 오류 로그
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 로그인
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};