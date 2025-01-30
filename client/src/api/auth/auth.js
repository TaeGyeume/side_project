import api from "../axios";  // axios.js에서 공통 설정을 가져옴

// 요청 기본 옵션 설정 (쿠키 및 캐시 방지)
const requestConfig = {
  withCredentials: true,
  headers: {
    "Cache-Control": "no-store",  // 캐시 방지
    "Content-Type": "application/json",
  },
};

// 공통 요청 처리 함수 (에러 핸들링 통합)
const handleRequest = async (requestPromise, errorMessage) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    // 
    // console.error(`${errorMessage}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(errorMessage);
  }
};

// 브라우저 쿠키 수동 삭제 (필요할 경우)
const clearCookiesManually = () => {
  document.cookie = "accessToken=; Max-Age=0; path=/;";
  document.cookie = "refreshToken=; Max-Age=0; path=/;";
  console.log("브라우저 쿠키 수동 삭제 완료");
};

// 인증 관련 API 함수 목록 (쿠키 기반 httpOnly)
export const authAPI = {
  registerUser: (userData) =>
    handleRequest(api.post("/auth/register", userData, requestConfig), "회원가입 요청 중 오류 발생"),

  loginUser: (loginData) =>
    handleRequest(api.post("/auth/login", loginData, requestConfig), "로그인 요청 중 오류 발생"),

  logoutUser: async () => {
    await handleRequest(api.post("/auth/logout", {}, requestConfig), "로그아웃 요청 중 오류 발생");
    clearCookiesManually();
  },

  getUserProfile: () =>
    handleRequest(api.get("/auth/profile", requestConfig), "프로필 조회 중 오류 발생"),

  checkDuplicate: (data) => api.post("/auth/check-duplicate", data, "프로필 중복확인중 오류 발생생"),

  updateProfile: (userData) =>
    api.put("/auth/profile/update", userData,"프로필 수정중 오류 발생생"),  
  changePassword: (passwordData) =>
    handleRequest(api.put("/auth/change-password", passwordData, requestConfig), "비밀번호 변경 중 오류 발생"),

  forgotPassword: (email) =>
    handleRequest(api.post("/auth/forgot-password", { email }, requestConfig), "비밀번호 찾기 요청 중 오류 발생"),

  resetPassword: (resetData) =>
    handleRequest(api.post("/auth/reset-password", resetData, requestConfig), "비밀번호 재설정 중 오류 발생"),
};

export default authAPI;
