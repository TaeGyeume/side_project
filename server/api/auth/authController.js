const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");

// JWT 생성 함수
const generateToken = (user) => {
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};


// 회원가입
exports.register = async (req, res) => {
  try {
    const { username, name, email, password, phone, gender, birthdate } = req.body;
    console.log("Register request body:", req.body);

    // 필수 필드 검증
    if (!username || !email || !password || !phone || !gender || !birthdate) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    // 이메일 및 사용자 이름 유효성 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "유효한 이메일 주소를 입력해주세요." });
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ message: "사용자 이름은 3~20자의 영문, 숫자, 밑줄(_)만 허용됩니다." });
    }

    // 비밀번호 유효성 검증 "비밀번호는 최소 8자, 영문, 숫자, 특수문자를 포함
    // if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    // return res.status(400).json({ message: "비밀번호는 최소 8자, 영문, 숫자, 특수문자를 포함해야 합니다." });
    // }

    // 비밀번호 유효성 검증 (최소 8자리)
    if (!/^[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return res.status(400).json({ message: "비밀번호는 최소 8자여야 합니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      birthdate,
    });

    await newUser.save();

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user: { id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let errorMessage = `${duplicateField} 필드가 중복되었습니다.`;
      if (duplicateField === "email") errorMessage = "이미 사용 중인 이메일입니다.";
      if (duplicateField === "phone") errorMessage = "이미 사용 중인 휴대전화번호입니다.";
      if (duplicateField === "username") errorMessage = "이미 사용 중인 사용자 이름입니다.";

      return res.status(400).json({ message: errorMessage });
    }

    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    if (!user.password) {
      return res.status(400).json({ message: "Facebook 계정으로 로그인한 사용자입니다. Facebook 로그인을 사용해주세요." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    const token = generateToken(user);

    res.status(200).json({
      message: "로그인 성공",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};
