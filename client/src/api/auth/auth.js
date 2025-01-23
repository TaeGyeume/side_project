import axios from "axios";

// Axios 인스턴스 생성 (백엔드 API 기본 설정)
const API = axios.create({
  baseURL: "http://localhost:5000/api",  // 백엔드 API 주소
  withCredentials: true,  // 쿠키 허용 (JWT 인증 사용 시 필수)
});

// 요청 인터셉터 (토큰 자동 추가)
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");  // 로컬스토리지에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 헤더에 토큰 추가
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API 함수 목록 (올바르게 axios 인스턴스 적용)
export const authAPI = {
  registerUser: (userData) => API.post("/auth/register", userData),
  loginUser: (loginData) => API.post("/auth/login", loginData),
  logoutUser: () => API.post("/auth/logout"),  // 로그아웃 API
  getUserProfile: () => API.get("/auth/profile"),  // 사용자 프로필 조회 API
  changePassword: (passwordData) => API.put("/auth/change-password", passwordData),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (resetData) => API.post("/auth/reset-password", resetData),
};

export default authAPI;
