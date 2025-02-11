const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendResetPasswordEmail = require('../config/emailConfig');
const RefreshToken = require('../models/RefreshToken');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const Verification = require('../models/Verification');
const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

const {v4: uuidv4} = require('uuid'); // 고유한 ID 생성 (필요시)

// 6자리 인증 코드 생성 및 MongoDB에 저장
const createVerificationCode = async email => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리 인증 코드 생성

    const verification = new Verification({
      email,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5분 후 만료
      used: false
    });

    await verification.save(); // ✅ MongoDB에 저장
    console.log('✅ [DB 저장 성공] 인증 코드:', verification); // 🔥 로그 추가
    return code;
  } catch (error) {
    console.error('❌ 인증 코드 저장 오류:', error.message);
    throw new Error('인증 코드 저장 오류 발생');
  }
};

// 인증 코드 검증 함수
exports.verifyCode = async (email, code) => {
  try {
    console.log('🔎 [서비스] 인증 코드 확인 요청:', email, code);

    const verification = await Verification.findOne({
      email,
      code,
      used: false // 이미 사용된 인증 코드인지 확인
    });

    if (!verification) {
      console.error('❌ [서비스] 잘못된 인증 코드 또는 코드가 없음:', email, code);
      throw new Error('잘못된 인증 코드입니다.');
    }

    // 인증 코드 만료 여부 확인
    if (new Date() > verification.expiresAt) {
      console.error('❌ [서비스] 인증 코드 만료됨:', email, code);
      throw new Error('인증 코드가 만료되었습니다.');
    }

    verification.used = true; // 사용된 인증 코드로 변경
    await verification.save(); // ✅ MongoDB에서 상태 업데이트
    console.log('✅ [서비스] 인증 코드 검증 성공:', email, code);

    return true;
  } catch (error) {
    console.error('❌ [서비스] 인증 코드 검증 실패:', error.message);
    throw new Error(error.message);
  }
};

// 이메일로 아이디 찾기 서비스
exports.findUserIdByEmail = async email => {
  try {
    console.log('📩 [서비스] 이메일 확인:', email);

    const user = await User.findOne({email});
    console.log('🔎 [서비스] 검색된 사용자:', user);

    if (!user) {
      console.log('❌ [서비스] 이메일로 가입된 아이디 없음:', email);
      throw new Error('해당 이메일로 가입된 아이디가 없습니다.');
    }

    // ✅ 인증 코드 생성 및 DB에 저장 (기존 코드에서 빠진 부분 추가)
    const verificationCode = await createVerificationCode(email);
    console.log('🔢 [서비스] 생성된 인증 코드:', verificationCode); // ✅ 인증 코드 확인

    console.log('📤 [서비스] 이메일 전송 시작...');
    await sendVerificationEmail(email, verificationCode);
    console.log('✅ [서비스] 인증 코드 이메일 발송 완료');

    return {message: '아이디 찾기 인증 코드가 이메일로 발송되었습니다.'};
  } catch (error) {
    console.error('❌ [서비스] 아이디 찾기 오류:', error.message);
    throw new Error('아이디 찾기 중 오류 발생');
  }
};

// 인증 코드 확인 후 아이디 반환
exports.verifyCodeAndFindUserId = async (email, code) => {
  try {
    const isVerified = await this.verifyCode(email, code);

    if (isVerified) {
      const user = await User.findOne({email});
      if (!user) {
        throw new Error('이메일에 해당하는 사용자가 없습니다.');
      }
      return {userId: user.userid, message: '아이디 찾기 성공'};
    } else {
      throw new Error('인증 코드가 유효하지 않습니다.');
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// 아이디, 이메일, 전화번호 중복 확인 서비스 추가
exports.checkDuplicate = async ({userid, email, phone}) => {
  let existingUser = null;

  if (userid) {
    existingUser = await User.findOne({userid});
    if (existingUser) throw new Error('이미 사용 중인 아이디입니다.');
  }

  if (email) {
    existingUser = await User.findOne({email});
    if (existingUser) throw new Error('이미 사용 중인 이메일입니다.');
  }

  if (phone) {
    existingUser = await User.findOne({phone});
    if (existingUser) throw new Error('이미 사용 중인 전화번호입니다.');
  }

  return {message: '사용 가능한 정보입니다.'};
};

// 회원가입 서비스
exports.registerUser = async ({userid, username, email, phone, password, address}) => {
  await this.checkDuplicate({userid, email, phone});

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    userid,
    username,
    email,
    phone,
    address,
    password: hashedPassword
  });
  await newUser.save();

  return {message: '회원가입이 완료되었습니다.'};
};

// 로그인 서비스 (액세스 토큰 및 리프레시 토큰 쿠키 저장)
exports.loginUser = async ({userid, password}, res) => {
  console.log('로그인 요청:', userid);

  const user = await User.findOne({userid});
  if (!user) throw new Error('아이디가 존재하지 않습니다.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('비밀번호가 일치하지 않습니다.');

  const accessToken = jwt.sign(
    {id: user._id, roles: user.roles},
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );

  const refreshToken = jwt.sign(
    {id: user._id, roles: user.roles},
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d'
    }
  );

  // 기존 리프레시 토큰 삭제 후 새 토큰 저장
  await RefreshToken.deleteMany({userId: user._id});

  const refreshTokenDoc = new RefreshToken({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
  });
  await refreshTokenDoc.save();

  // 액세스 토큰 쿠키 저장
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 15분
  });

  // 리프레시 토큰 쿠키 저장
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
  });

  return {accessToken, user: {userid: user.userid, email: user.email, roles: user.roles}};
};

// 사용자 프로필 조회 서비스
exports.getProfile = async userId => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');
  return user;
};

// 사용자 프로필 업데이트 서비스
exports.updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');

  //  변경된 데이터만 검사 (자기 자신의 기존 데이터 제외)
  if (updateData.userid && updateData.userid !== user.userid) {
    const existingUser = await User.findOne({userid: updateData.userid});
    if (existingUser) throw new Error('이미 사용 중인 아이디입니다.');
  }

  if (updateData.email && updateData.email !== user.email) {
    const existingEmail = await User.findOne({email: updateData.email});
    if (existingEmail) throw new Error('이미 사용 중인 이메일입니다.');
  }

  if (updateData.phone && updateData.phone !== user.phone) {
    const existingPhone = await User.findOne({phone: updateData.phone});
    if (existingPhone) throw new Error('이미 사용 중인 전화번호입니다.');
  }

  //  변경된 필드만 업데이트
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true
  }).select('-password');

  return {message: '프로필이 성공적으로 업데이트되었습니다.', user: updatedUser};
};

// 비밀번호 변경 서비스
exports.changePassword = async (userId, {currentPassword, newPassword}) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('사용자를 찾을 수 없습니다.');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error('현재 비밀번호가 일치하지 않습니다.');

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return {message: '비밀번호가 성공적으로 변경되었습니다.'};
};

// 비밀번호 찾기 서비스 (비밀번호 재설정 링크 전송)
exports.forgotPassword = async email => {
  const user = await User.findOne({email});
  if (!user) throw new Error('이메일을 찾을 수 없습니다.');

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 3600000; // 1시간 후 만료

  await user.save();
  await sendResetPasswordEmail(email, resetToken);

  return {message: '비밀번호 재설정 이메일이 발송되었습니다.'};
};

// 비밀번호 재설정 서비스
exports.resetPassword = async ({userId, token, currentPassword, newPassword}) => {
  let user = null;

  // 🔐 로그인된 사용자의 비밀번호 변경 (현재 비밀번호 확인)
  if (userId) {
    user = await User.findById(userId);
    if (!user) throw new Error('사용자를 찾을 수 없습니다.');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('현재 비밀번호가 일치하지 않습니다.');
  }

  // 📧 비밀번호 재설정 (비밀번호 찾기 후 이메일 링크로 받은 토큰 기반)
  if (token) {
    user = await User.findOne({
      passwordResetExpires: {$gt: Date.now()}
    });

    if (!user) {
      throw new Error('토큰이 유효하지 않거나 만료되었습니다.');
    }

    // 🔑 토큰 검증 (bcrypt.compare 사용)
    const isValidToken = await bcrypt.compare(token, user.passwordResetToken);
    if (!isValidToken) {
      throw new Error('토큰이 유효하지 않습니다.');
    }
  }

  if (!user) throw new Error('비밀번호를 변경할 수 없습니다.');

  // 🔒 새 비밀번호 설정
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return {message: '비밀번호가 성공적으로 변경되었습니다.'};
};

// 로그아웃 서비스 (쿠키 삭제)
exports.logoutUser = async (res, userId) => {
  if (userId) {
    await RefreshToken.deleteMany({userId}); //  유저의 모든 리프레시 토큰 삭제
  }

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'None',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'None',
    path: '/'
  });
};

// 리프레시 토큰 갱신 서비스 (액세스 토큰 및 리프레시 토큰 재발급)
exports.refreshAccessToken = async (refreshToken, res) => {
  try {
    if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshToken.findOne({
      userId: decoded.id,
      token: refreshToken
    });

    if (!storedToken) {
      throw new Error('유효하지 않은 리프레시 토큰입니다.');
    }

    const newAccessToken = jwt.sign(
      {id: decoded.id, roles: decoded.roles},
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    const newRefreshToken = jwt.sign(
      {id: decoded.id, roles: decoded.roles},
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // 기존 리프레시 토큰 삭제 후 새로운 토큰 저장
    await RefreshToken.deleteMany({userId: decoded.id});
    const newRefreshTokenDoc = new RefreshToken({
      userId: decoded.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await newRefreshTokenDoc.save();

    // 새로운 리프레시 토큰 쿠키 저장
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // 새로운 액세스 토큰 쿠키 저장
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return newAccessToken;
  } catch (error) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'None',
      path: '/'
    });
    throw new Error('유효하지 않은 리프레시 토큰입니다.');
  }
};
