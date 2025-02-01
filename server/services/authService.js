const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendResetPasswordEmail = require("../config/emailConfig");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

// 아이디, 이메일, 전화번호 중복 확인 서비스 추가
exports.checkDuplicate = async ({ userid, email, phone }) => {
  let existingUser = null;

  if (userid) {
    existingUser = await User.findOne({ userid });
    if (existingUser) throw new Error("이미 사용 중인 아이디입니다.");
  }

  if (email) {
    existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("이미 사용 중인 이메일입니다.");
  }

  if (phone) {
    existingUser = await User.findOne({ phone });
    if (existingUser) throw new Error("이미 사용 중인 전화번호입니다.");
  }

  return { message: "사용 가능한 정보입니다." };
};

// 회원가입 서비스
exports.registerUser = async ({ userid, username, email, phone, password, address }) => {
  await this.checkDuplicate({ userid, email, phone });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ userid, username, email, phone,address, password: hashedPassword });
  await newUser.save();

  return { message: "회원가입이 완료되었습니다." };
};


//  로그인 서비스 
exports.loginUser = async ({ userid, password }, res) => {
  console.log("로그인 요청:", userid);

  const user = await User.findOne({ userid });
  if (!user) throw new Error("아이디가 존재하지 않습니다.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("비밀번호가 일치하지 않습니다.");

  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  //  기존 리프레시 토큰 삭제 후 새 토큰 저장
  await RefreshToken.deleteMany({ userId: user._id });

  const refreshTokenDoc = new RefreshToken({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await refreshTokenDoc.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
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
exports.updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("사용자를 찾을 수 없습니다.");

  //  변경된 데이터만 검사 (자기 자신의 기존 데이터 제외)
  if (updateData.userid && updateData.userid !== user.userid) {
    const existingUser = await User.findOne({ userid: updateData.userid });
    if (existingUser) throw new Error("이미 사용 중인 아이디입니다.");
  }
  
  if (updateData.email && updateData.email !== user.email) {
    const existingEmail = await User.findOne({ email: updateData.email });
    if (existingEmail) throw new Error("이미 사용 중인 이메일입니다.");
  }
  
  if (updateData.phone && updateData.phone !== user.phone) {
    const existingPhone = await User.findOne({ phone: updateData.phone });
    if (existingPhone) throw new Error("이미 사용 중인 전화번호입니다.");
  }

  //  변경된 필드만 업데이트
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return { message: "프로필이 성공적으로 업데이트되었습니다.", user: updatedUser };
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
exports.resetPassword = async ({ userId, token, currentPassword, newPassword }) => {
  let user = null;

  //  로그인된 사용자의 비밀번호 변경 (현재 비밀번호 확인 필요)
  if (userId) {
    user = await User.findById(userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error("현재 비밀번호가 일치하지 않습니다.");
  }

  //  비밀번호 재설정 (비밀번호 찾기 후 이메일 링크로 받은 토큰 기반)
  if (token) {
    user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
      throw new Error("토큰이 유효하지 않거나 만료되었습니다.");
    }
  }

  if (!user) throw new Error("비밀번호를 변경할 수 없습니다.");

  //  새 비밀번호 설정
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { message: "비밀번호가 성공적으로 변경되었습니다." };
};


// 로그아웃 서비스 (쿠키 삭제)
// ✅ 로그아웃 서비스 (리프레시 토큰 삭제 추가)
exports.logoutUser = async (res, userId) => {
  if (userId) {
    await RefreshToken.deleteMany({ userId }); //  유저의 모든 리프레시 토큰 삭제
  }

  res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
};

//  리프레시 토큰 갱신 서비스 (DB에서 검증 후 재발급)
exports.refreshAccessToken = async (refreshToken, res) => {
  try {
    if (!refreshToken) throw new Error("리프레시 토큰이 없습니다.");

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshToken.findOne({ userId: decoded.id, token: refreshToken });

    //  DB에 저장된 리프레시 토큰과 비교
    if (!storedToken) {
      throw new Error("유효하지 않은 리프레시 토큰입니다.");
    }

    //  새 액세스 토큰 및 리프레시 토큰 발급
    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    //  기존 리프레시 토큰 삭제 후 새로운 토큰 저장
    await RefreshToken.deleteMany({ userId: decoded.id });

    const newRefreshTokenDoc = new RefreshToken({
      userId: decoded.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
    });
    await newRefreshTokenDoc.save();

    //  새로운 리프레시 토큰을 쿠키에 저장
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    return newAccessToken;
  } catch (error) {
    res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "None", path: "/" });
    throw new Error("유효하지 않은 리프레시 토큰입니다.");
  }
};