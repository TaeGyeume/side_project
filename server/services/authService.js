const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendResetPasswordEmail = require("../config/emailConfig");
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

// 회원가입 서비스
exports.registerUser = async ({ userid, username, email, phone, password }) => {
  const existingUser = await User.findOne({ $or: [{ userid }, { email }, { phone }] });
  if (existingUser) {
    throw new Error("이미 등록된 아이디, 이메일 또는 전화번호입니다.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ userid, username, email, phone, password: hashedPassword });
  await newUser.save();

  return { message: "회원가입이 완료되었습니다." };
};

// 로그인 서비스 (쿠키 기반 인증)
exports.loginUser = async ({ userid, password }, res) => {
  console.log("로그인 요청:", userid);

  const user = await User.findOne({ userid });
  if (!user) throw new Error("아이디가 존재하지 않습니다.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("비밀번호가 일치하지 않습니다.");

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, user: { userid: user.userid, email: user.email, roles: user.roles } };
};

// 사용자 프로필 조회 서비스
exports.getProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");
  return user;
};

// 사용자 프로필 업데이트 서비스
exports.updateUserProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select("-password");
  if (!user) throw new Error("사용자 업데이트 실패");
  return { message: "프로필이 성공적으로 업데이트되었습니다.", user };
};

// 비밀번호 변경 서비스
exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("현재 비밀번호가 일치하지 않습니다.");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: "비밀번호가 성공적으로 변경되었습니다." };
};

// 비밀번호 찾기 서비스 (비밀번호 재설정 링크 전송)
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("이메일을 찾을 수 없습니다.");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1시간 후 만료

  await user.save();
  await sendResetPasswordEmail(email, resetToken);

  return { message: "비밀번호 재설정 이메일이 발송되었습니다." };
};

// 비밀번호 재설정 서비스
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ passwordResetExpires: { $gt: Date.now() } });

  if (!user || !(await bcrypt.compare(token, user.passwordResetToken))) {
    throw new Error("토큰이 유효하지 않거나 만료되었습니다.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: "비밀번호가 성공적으로 재설정되었습니다." };
};

// 로그아웃 서비스 (쿠키 삭제)
exports.logoutUser = (res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
};

// 리프레시 토큰 갱신 서비스
exports.refreshAccessToken = async (refreshToken, res) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "None",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return newAccessToken;
  } catch (error) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
    throw new Error("유효하지 않은 리프레시 토큰입니다.");
  }
};
