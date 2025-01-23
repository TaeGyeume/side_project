const authService = require("../services/authService");

//######################
// 클라이언트 요청 처리
// #####################

// 회원가입 컨트롤러
exports.register = async (req, res) => {
  try {
    const response = await authService.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 로그인 컨트롤러
exports.login = async (req, res) => {
  try {
    const response = await authService.loginUser(req.body, res);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  authService.logoutUser(res);
  res.status(200).json({ message: "로그아웃 되었습니다." });
};

// 리프레시 토큰 컨트롤러
exports.refreshToken = (req, res) => {
  try {
    const newToken = authService.refreshAccessToken(req.cookies.refreshToken);
    res.status(200).json({ accessToken: newToken });
  } catch (error) {
    res.status(403).json({ message: "유효하지 않은 리프레시 토큰입니다." });
  }
};
