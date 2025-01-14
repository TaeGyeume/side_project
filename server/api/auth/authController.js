const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios"); // Facebook Graph API 호출에 사용
const User = require("../../models/User");
require("dotenv").config({ path: __dirname + "/.env" }); // .env 파일이 server 디렉토리에 있는 경우

// JWT 생성 함수
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  }
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Facebook 로그인 리디렉션
exports.facebookLogin = (req, res) => {
  const redirectUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}&state={st=state123abc,ds=123456789}`;
  res.redirect(redirectUrl);
};

// Facebook 로그인 콜백
exports.facebookLoginCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Facebook에서 액세스 토큰 요청
    const tokenResponse = await axios.get(
      `https://graph.facebook.com/v12.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
    );
    const accessToken = tokenResponse.data.access_token;

    // Facebook Graph API를 사용하여 사용자 정보 가져오기
    const userResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    const { id, name, email } = userResponse.data;

    // 사용자 조회 또는 생성
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: `facebook_${id}`,
        name,
        email,
        password: null, // Facebook 로그인 사용자이므로 비밀번호는 null
        isFacebookUser: true,
      });
      await user.save();
    }

    // JWT 생성
    const token = generateToken(user);

    // 클라이언트로 리디렉션 (JWT 및 사용자 정보 전달)
    const redirectUrl = `${process.env.CLIENT_URL}/login?token=${token}&user=${encodeURIComponent(
      JSON.stringify({ id: user._id, username: user.username, email: user.email })
    )}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Facebook 로그인 실패:", error.message);
    res.status(500).json({ message: "Facebook 로그인 중 문제가 발생했습니다." });
  }
};


// 기존 회원가입 로직 (유지)
exports.register = async (req, res) => {
  try {
    const { username, name, email, password, phone, gender, birthdate } = req.body;

    if (!username || !email || !password || !phone || !gender || !birthdate) {
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "유효한 이메일 주소를 입력해주세요." });
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ message: "사용자 이름은 3~20자의 영문, 숫자, 밑줄(_)만 허용됩니다." });
    }
    
    // 비밀번호 유효성 검증 (최소 8자리)
    if (!/^[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return res.status(400).json({ message: "비밀번호는 최소 8자여야 합니다." });
    }
    
    // 비밀번호 유효성 검증 (8문자, 숫자, 특수문자 포함)
    // if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
    //   return res.status(400).json({
    //     message: "비밀번호는 최소 8자, 하나 이상의 문자, 숫자, 특수문자를 포함해야 합니다.",
    //   });
    // }

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

    res.status(500).json({ message: "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요." });
  }
};

// 기존 로그인 로직 (유지)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "등록되지 않은 이메일 주소입니다." });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Facebook 계정으로 로그인한 사용자입니다. Facebook 로그인을 사용해주세요.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "로그인 성공",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요." });
  }
};
