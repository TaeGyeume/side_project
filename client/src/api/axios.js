import axios from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api", // 서버 URL
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken"); // 로컬 스토리지에서 JWT 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더 설정
    }
    return config; // 요청이 계속 진행되도록 반환
  },
  (error) => {
    return Promise.reject(error); // 요청 에러 처리
  }
);

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // 응답 데이터 그대로 반환
  },
  (error) => {
    // 인증 실패 처리 (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("jwtToken"); // 로컬 스토리지에서 JWT 제거
      alert("세션이 만료되었습니다. 다시 로그인해주세요."); // 사용자 알림
      window.location.href = "/login"; // 로그인 페이지로 리디렉션
    }

    // 서버 에러 처리 (500 Internal Server Error)
    if (error.response && error.response.status === 500) {
      console.error("서버 오류:", error.response.data);
      alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }

    return Promise.reject(error); // 에러 그대로 반환
  }
);

export default axiosInstance;
