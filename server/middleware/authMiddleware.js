const jwt = require('jsonwebtoken');
const cookieOptions = require('../config/cookieConfig');
const RefreshToken = require('../models/RefreshToken');

const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // 액세스 토큰이 없으면 인증 실패
  if (!accessToken) {
    return res.status(401).json({message: '인증이 필요합니다.'});
  }

  try {
    // 액세스 토큰 검증
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decodedToken;
    next(); // 인증 성공 시 다음 미들웨어로 이동
  } catch (error) {
    console.error('액세스 토큰 검증 실패:', error.message);

    // 액세스 토큰 만료 시 리프레시 토큰으로 새로운 액세스 토큰 발급 시도
    if (error.name === 'TokenExpiredError' && refreshToken) {
      try {
        // 리프레시 토큰 검증
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // 데이터베이스에 저장된 리프레시 토큰 확인
        const storedToken = await RefreshToken.findOne({
          userId: decodedRefreshToken.id,
          token: refreshToken
        });

        if (!storedToken) {
          throw new Error('DB에 저장된 리프레시 토큰이 없습니다.');
        }

        // 새로운 액세스 토큰 발급
        const newAccessToken = jwt.sign(
          {id: decodedRefreshToken.id},
          process.env.JWT_SECRET,
          {
            expiresIn: '7d'
          }
        );

        // 새로 발급한 액세스 토큰 쿠키에 저장
        res.cookie('accessToken', newAccessToken, {
          ...cookieOptions,
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 15 * 60 * 1000, // 15분
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
        });

        req.user = jwt.verify(newAccessToken, process.env.JWT_SECRET); // 새 토큰으로 사용자 정보 갱신
        next(); // 인증 성공 후 다음 미들웨어로 이동
      } catch (refreshError) {
        console.error('리프레시 토큰 검증 실패:', refreshError.message);

        // 리프레시 토큰 검증 실패 시 쿠키 삭제 및 로그인 요청
        res.clearCookie('accessToken', {
          ...cookieOptions,
          secure: false
        });
        res.clearCookie('refreshToken', {
          ...cookieOptions,
          secure: false
        });

        return res
          .status(403)
          .json({message: '세션이 만료되었습니다. 다시 로그인해주세요.'});
      }
    } else {
      // 액세스 토큰 검증 실패(만료 이외의 이유) 시 처리
      res.clearCookie('accessToken', {
        ...cookieOptions,
        secure: false
      });
      res.clearCookie('refreshToken', {
        ...cookieOptions,
        secure: false
      });

      return res
        .status(401)
        .json({message: '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.'});
    }
  }
};

module.exports = authMiddleware;
