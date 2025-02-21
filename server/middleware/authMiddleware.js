const jwt = require('jsonwebtoken');
const cookieOptions = require('../config/cookieConfig');
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User'); // ✅ 유저 정보 가져오기 위해 추가

const authMiddleware = async (req, res, next) => {
  console.log('📝 요청된 쿠키:', req.cookies);
  console.log('📝 요청된 헤더:', req.headers);

  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    console.log('❌ 액세스 토큰이 없음. 401 Unauthorized 발생');
    return res.status(401).json({message: '인증이 필요합니다.'});
  }

  try {
    // 액세스 토큰 검증 및 user 정보 추출
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decodedToken; // decodedToken에서 user 정보 추출 후 req.user에 설정

    console.log('✅ 인증된 사용자:', req.user);

    next(); // 인증 성공 시 다음 미들웨어 실행
  } catch (error) {
    console.error('❌ 액세스 토큰 검증 실패:', error.message);

    // 액세스 토큰 만료 시 리프레시 토큰 검증
    if (error.name === 'TokenExpiredError' && refreshToken) {
      try {
        console.log('🔄 리프레시 토큰 검증 시작');

        // 리프레시 토큰 검증
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        console.log('✅ 리프레시 토큰 디코딩 완료:', decodedRefreshToken);

        // DB에서 리프레시 토큰 확인
        const storedToken = await RefreshToken.findOne({userId: decodedRefreshToken.id});

        if (!storedToken || storedToken.token !== refreshToken) {
          console.error('❌ DB에서 리프레시 토큰을 찾을 수 없습니다.');
          throw new Error('DB에 저장된 리프레시 토큰이 없거나 일치하지 않습니다.');
        }

        // 유저 정보 가져오기
        const user = await User.findById(decodedRefreshToken.id);
        if (!user) {
          throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        console.log('✅ 새로운 액세스 토큰 발급 - 사용자 정보:', user);

        // 새로운 액세스 토큰 발급 (`roles` 포함)
        const newAccessToken = jwt.sign(
          {id: user._id, roles: user.roles || ['user']}, // `roles` 포함
          process.env.JWT_SECRET,
          {expiresIn: '1h'}
        );

        res.cookie('accessToken', newAccessToken, {
          ...cookieOptions,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 15 * 60 * 1000, // 15분
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
        });

        // 클라이언트에서 쿠키를 받을 수 있도록 설정 추가
        res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

        req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET);
        console.log('✅ 새 액세스 토큰 발급 완료:', req.user);

        next(); // 새로운 액세스 토큰 발급 후 다음 미들웨어 실행
      } catch (refreshError) {
        console.error('❌ 리프레시 토큰 검증 실패:', refreshError.message);

        res.clearCookie('accessToken', {path: '/'});
        res.clearCookie('refreshToken', {path: '/'});

        return res
          .status(403)
          .json({message: '세션이 만료되었습니다. 다시 로그인해주세요.'});
      }
    } else {
      res.clearCookie('accessToken', {path: '/'});
      res.clearCookie('refreshToken', {path: '/'});

      return res
        .status(401)
        .json({message: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.'});
    }
  }
};

module.exports = authMiddleware;
