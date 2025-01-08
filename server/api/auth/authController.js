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

    // 필수 필드 검증
    if (!username || !email || !password || !phone || !gender || !birthdate) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
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
      birthdate,
    });

    // DB에 저장
    await newUser.save();

    // 가입 성공 응답
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("Register error:", error);

    // MongoDB 중복 키 오류 처리
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0]; // 중복된 필드 추출
      let errorMessage;

      if (duplicateField === "email") {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (duplicateField === "phone") {
        errorMessage = "이미 사용 중인 휴대전화번호입니다.";
      } else if (duplicateField === "username") {
        errorMessage = "이미 사용 중인 사용자 이름입니다.";
      } else {
        errorMessage = `${duplicateField} 필드가 중복되었습니다.`;
      }

      return res.status(400).json({ message: errorMessage });
    }

    // 기타 오류 처리
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일로 유저 조회
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    // JWT 발급
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // 로그인 성공 응답
    res.status(200).json({ message: "로그인 성공", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다.", error: error.message });
  }
};
