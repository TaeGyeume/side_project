import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 5000,
  withCredentials: true, // httpOnly 쿠키 전송 허용
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("리프레시 토큰 요청 중...");

        const res = await api.post("/auth/refresh-token");

        if (res.status === 200) {
          console.log("리프레시 토큰 갱신 성공");
          return api(originalRequest); // 원래 요청 재시도
        }
      } catch (refreshError) {
        console.error("리프레시 토큰 갱신 실패:", refreshError.response?.data?.message || refreshError.message);
        
        if (refreshError.response?.status === 401) {
          console.error("리프레시 토큰이 유효하지 않음, 로그아웃 처리");
          window.location.href = "/login";
        }
      }
    }

    if (error.response?.status === 403) {
      console.error("접근 권한 없음, 로그아웃 처리");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
