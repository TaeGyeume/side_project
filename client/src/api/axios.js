import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 5000,
  withCredentials: true // httpOnly 쿠키 전송 허용
});

let isRefreshing = false;

// 응답 인터셉터
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 무한 루프 방지: 401 에러 && 요청이 반복되지 않도록 설정
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return Promise.reject(error); // 현재 갱신 중이면 추가 요청 방지
      }

      isRefreshing = true;

      try {
        // console.log("리프레시 토큰 요청 중...");

        // 리프레시 토큰 API 요청
        const res = await api.post('/auth/refresh-token');

        if (res.status === 200) {
          console.log('리프레시 토큰 갱신 성공');
          isRefreshing = false;
          return api(originalRequest); // 원래 요청 재시도
        }
      } catch (refreshError) {
        // console.error("리프레시 토큰 갱신 실패:", refreshError.response?.data?.message || refreshError.message);

        isRefreshing = false;

        // 쿠키 및 로컬 스토리지 확인 후 리다이렉트
        const refreshTokenExists = document.cookie.includes('refreshToken');
        if (!refreshTokenExists && !localStorage.getItem('userLoggedOut')) {
          localStorage.setItem('userLoggedOut', 'true'); // 중복 리다이렉트 방지
          // console.log("리프레시 토큰 없음, 로그인 페이지로 이동");
          window.location.href = '/login';
        }
      }
    }

    // 403 접근 권한 없음 -> 로그인 페이지 이동
    if (error.response?.status === 403 && !localStorage.getItem('userLoggedOut')) {
      localStorage.setItem('userLoggedOut', 'true');
      // console.error("접근 권한 없음, 로그아웃 처리");
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 로그아웃 함수 추가
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout', {}, {withCredentials: true});
    return response.data;
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
};

export default api;
