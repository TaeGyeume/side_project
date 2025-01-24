import api from "../axios";  // axios.js에서 공통 설정을 가져옴

// 공통 요청 처리 함수 (에러 핸들링 통합)
const handleRequest = async (requestPromise, errorMessage) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    console.error(`${errorMessage}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(errorMessage);
  }
};

// 인증 관련 API 함수 목록 (쿠키 기반 httpOnly)
export const authAPI = {
  registerUser: (userData) =>
    handleRequest(api.post("/auth/register", userData), "회원가입 요청 중 오류 발생"),

  loginUser: (loginData) =>
    handleRequest(api.post("/auth/login", loginData), "로그인 요청 중 오류 발생"),

  logoutUser: () =>
    handleRequest(api.post("/auth/logout"), "로그아웃 요청 중 오류 발생"),

  getUserProfile: () =>
    handleRequest(api.get("/auth/profile"), "프로필 조회 중 오류 발생"),

  changePassword: (passwordData) =>
    handleRequest(api.put("/auth/change-password", passwordData), "비밀번호 변경 중 오류 발생"),

  forgotPassword: (email) =>
    handleRequest(api.post("/auth/forgot-password", { email }), "비밀번호 찾기 요청 중 오류 발생"),

  resetPassword: (resetData) =>
    handleRequest(api.post("/auth/reset-password", resetData), "비밀번호 재설정 중 오류 발생"),
};

export default authAPI;
