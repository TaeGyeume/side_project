const cookieOptions = {
  httpOnly: true,  // 클라이언트에서 쿠키 접근 불가
  secure: process.env.NODE_ENV === "production",  // 프로덕션 환경에서만 true
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",  // 환경에 따른 설정
  path: "/",  // 전체 경로에서 쿠키 사용
};

module.exports = cookieOptions;
