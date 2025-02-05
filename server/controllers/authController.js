const authService = require('../services/authService');
const cookieOptions = require('../config/cookieConfig');

// 아이디, 이메일, 전화번호 중복 확인 컨트롤러
exports.checkDuplicate = async (req, res) => {
  try {
    const response = await authService.checkDuplicate(req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// 회원가입 컨트롤러
exports.register = async (req, res) => {
  try {
    const response = await authService.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// 로그인 컨트롤러 (액세스 및 리프레시 토큰 설정)
exports.login = async (req, res) => {
  try {
    const {accessToken, refreshToken, user} = await authService.loginUser(req.body, res);

    // 공통 쿠키 설정 옵션
    const tokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 배포 환경에서는 secure 활성화
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 크로스 사이트 쿠키 허용
      path: '/',
      maxAge: 15 * 60 * 1000 // 액세스 토큰은 15분 유효
    };

    res.cookie('accessToken', accessToken, tokenCookieOptions);

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        ...tokenCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 리프레시 토큰은 7일 유효
      });
    }

    res.status(200).json({user});
  } catch (error) {
    console.error('로그인 오류:', error.message);
    res.status(400).json({message: '로그인에 실패했습니다.'});
  }
};

// 사용자 프로필 조회 컨트롤러
exports.getUserProfile = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// 사용자 프로필 수정 컨트롤러
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const response = await authService.updateProfile(userId, updateData);

    res.status(200).json(response);
  } catch (error) {
    console.error('프로필 업데이트 오류:', error.message);
    res.status(400).json({message: error.message || '서버 오류가 발생했습니다.'});
  }
};

// 비밀번호 변경 컨트롤러
exports.changePassword = async (req, res) => {
  try {
    const response = await authService.changePassword(req.user.id, req.body);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// 비밀번호 찾기 컨트롤러
exports.forgotPassword = async (req, res) => {
  try {
    const response = await authService.forgotPassword(req.body.email);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// 비밀번호 재설정 컨트롤러
exports.resetPassword = async (req, res) => {
  try {
    const {token, currentPassword, newPassword} = req.body;
    const userId = req.user ? req.user.id : null;

    if (!newPassword) {
      return res.status(400).json({message: '새 비밀번호를 입력해주세요.'});
    }

    const response = await authService.resetPassword({
      userId,
      token,
      currentPassword,
      newPassword
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({message: error.message || '비밀번호 변경에 실패했습니다.'});
  }
};

// 로그아웃 컨트롤러 (쿠키 삭제 + DB에서 리프레시 토큰 삭제)
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id;

    await authService.logoutUser(res, userId);

    res.clearCookie('accessToken', {
      ...cookieOptions,
      secure: false
    });

    res.clearCookie('refreshToken', {
      ...cookieOptions,
      secure: false
    });

    res.status(200).json({message: '로그아웃 성공'});
  } catch (error) {
    console.error('로그아웃 오류:', error.message);
    res.status(500).json({message: '로그아웃 처리 실패', error: error.message});
  }
};

// 리프레시 토큰을 이용한 액세스 토큰 갱신
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({message: '리프레시 토큰이 없습니다.'});
    }

    const newAccessToken = await authService.refreshAccessToken(refreshToken, res);

    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      secure: false
    });

    res.status(200).json({message: '토큰 갱신 성공'});
  } catch (error) {
    res.clearCookie('refreshToken', {
      path: '/',
      secure: false,
      sameSite: 'Lax'
    });
    res
      .status(403)
      .json({message: '유효하지 않은 리프레시 토큰입니다. 다시 로그인해주세요.'});
  }
};
