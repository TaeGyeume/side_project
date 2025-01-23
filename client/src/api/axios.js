import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // 기본 URL
  timeout: 5000 // 요청 제한 시간
});

// 요청 인터셉터 설정 (예: 토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 설정 (예: 오류 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 오류 발생:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
