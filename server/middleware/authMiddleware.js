const jwt = require('jsonwebtoken');
const cookieOptions = require('../config/cookieConfig');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User'); // ✅ 유저 정보 가져오기 위해 추가

const authMiddleware = async (req, res, next) => {
  // const accessToken = req.cookies.accessToken;
  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  console.log('🛠️ [authMiddleware] 받은 accessToken:', accessToken);
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({message: '인증이 필요합니다.'});
  }

  try {
    // ✅ 액세스 토큰 검증 및 `roles` 포함
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decodedToken;

    console.log('✅ 인증된 사용자:', req.user); // ✅ 콘솔에서 확인

    next(); // 인증 성공 시 다음 미들웨어 실행
  } catch (error) {
    console.error('❌ 액세스 토큰 검증 실패:', error.message);

    // ✅ 액세스 토큰 만료 시 리프레시 토큰 확인
    if (error.name === 'TokenExpiredError' && refreshToken) {
      try {
        // ✅ 리프레시 토큰 검증
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const storedToken = await RefreshToken.findOne({
          userId: decodedRefreshToken.id,
          token: refreshToken
        });

        if (!storedToken) {
          throw new Error('DB에 저장된 리프레시 토큰이 없습니다.');
        }

        // ✅ 유저 정보 가져오기
        const user = await User.findById(decodedRefreshToken.id);
        if (!user) {
          throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        console.log('✅ 새로운 액세스 토큰 발급 - 사용자 정보:', user);

        // ✅ 새로운 액세스 토큰 발급 (`roles` 포함)
        const newAccessToken = jwt.sign(
          {id: user._id, roles: user.roles || ['user']}, // ✅ 역할 추가
          process.env.JWT_SECRET,
          {expiresIn: '1h'}
        );

        // ✅ 새 액세스 토큰을 쿠키에 저장
        res.cookie('accessToken', newAccessToken, {
          ...cookieOptions,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 15 * 60 * 1000, // 15분
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
        });

        req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET); // ✅ `roles` 포함된 유저 정보 갱신
        console.log('✅ 새 액세스 토큰 발급 완료:', req.user);
        next();
      } catch (refreshError) {
        console.error('❌ 리프레시 토큰 검증 실패:', refreshError.message);

        // ✅ 리프레시 토큰 만료 시 쿠키 삭제 및 로그인 요청
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res
          .status(403)
          .json({message: '세션이 만료되었습니다. 다시 로그인해주세요.'});
      }
    } else {
      // ✅ 인증 실패 (토큰 오류)
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res
        .status(401)
        .json({message: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.'});
    }
  }
};

module.exports = authMiddleware;
