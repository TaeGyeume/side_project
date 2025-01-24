const authService = require("../services/authService");

// 회원가입 컨트롤러
exports.register = async (req, res) => {
  try {
    const response = await authService.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 로그인 컨트롤러 (쿠키에 accessToken 및 refreshToken 저장)
exports.login = async (req, res) => {
  try {
    console.log("로그인 요청 데이터:", req.body);

    const { accessToken, refreshToken, user } = await authService.loginUser(req.body, res);

    // 액세스 토큰을 httpOnly 쿠키로 설정
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 15 * 60 * 1000,  // 15분
    });

    // // 리프레시 토큰을 httpOnly 쿠키로 설정
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production" ? true : false,  // 개발 환경에서는 false
    //   sameSite: "None",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,  // 7일
    // });

    res.status(200).json({ user });
  } catch (error) {
    console.error("로그인 오류:", error.message);
    res.status(400).json({ message: "로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요." });
  }
};

// 사용자 프로필 조회 컨트롤러
exports.getUserProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 사용자 프로필 수정 컨트롤러
exports.updateProfile = async (req, res) => {
  try {
    const response = await authService.updateUserProfile(req.user.id, req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 비밀번호 변경 컨트롤러
exports.changePassword = async (req, res) => {
  try {
    const response = await authService.changePassword(req.user.id, req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 비밀번호 찾기 컨트롤러
exports.forgotPassword = async (req, res) => {
  try {
    const response = await authService.forgotPassword(req.body.email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 비밀번호 재설정 컨트롤러
exports.resetPassword = async (req, res) => {
  try {
    const response = await authService.resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 로그아웃 컨트롤러
exports.logout = (req, res) => {
  try {
    res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "None" });

    res.status(200).json({ message: "로그아웃 되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "로그아웃 처리 중 오류가 발생했습니다." });
  }
};

// 리프레시 토큰을 이용한 액세스 토큰 갱신 컨트롤러
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "리프레시 토큰이 없습니다. 다시 로그인 해주세요." });
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken, res);

    res.status(200).json({ message: "토큰이 갱신되었습니다." });
  } catch (error) {
    res.clearCookie("refreshToken");
    res.status(403).json({ message: "유효하지 않은 리프레시 토큰입니다. 다시 로그인 해주세요." });
  }
};
