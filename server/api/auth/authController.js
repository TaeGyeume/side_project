const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");

// JWT 생성 함수
const generateToken = (user) => {
  const payload = { id: user._id };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// 회원가입
exports.register = async (req, res) => {
  try {
    // 클라이언트에서 전달된 회원가입 정보
    const { username, name, email, password, phone, gender, birthdate } = req.body;
    console.log("Register request body:", req.body); // 요청 데이터 로그
    
     // 중복 확인
     const existingUser = await User.findOne({ $or: [{ email }, { username }] });
     if (existingUser) {
       return res.status(400).json({ message: "이미 가입된 이메일 또는 사용자 이름입니다." });
     }

    // 필수 필드 검증
    if (!username || !email || !password || !phone || !gender || !birthdate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // User 모델 인스턴스 생성
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthdate
    });

    // DB에 저장
    await newUser.save();

    // 가입 성공 응답
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일로 유저 조회
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

    // JWT 발급
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // 또는 generateToken(user) 사용:
    // const token = generateToken(user);

    // 로그인 성공 응답
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
