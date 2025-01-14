/**
 * =============================================================================
 *  AXIOS INSTANCE CONFIGURATION(악시오스 인터셉터) (axiosInstance.js)
 * =============================================================================
 * 
 * 이 파일은 클라이언트 전역에서 사용할 Axios 인스턴스를 설정해 둔 곳입니다.
 * - baseURL 지정 (process.env.REACT_APP_API_URL || http://localhost:5000/api)
 * - 요청(Request) 인터셉터 (JWT 토큰 자동 첨부)
 * - 응답(Response) 인터셉터 (에러 핸들링)
 * 
 * 만약 ChatGPT 또는 다른 자료에서 
 * "axios 인터셉터를 수정해라" / "axios 설정을 변경해라" 라고 한다면,
 * 바로 이 파일을 수정하시면 됩니다.
 * 
 * 주의: 로컬 스토리지에서 가져오는 토큰 키 이름이 'token'과 다르다면,
 *       아래에서 localStorage.getItem("token") 부분을 적절히 변경하세요.
 */

import axios from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // 여기에서 localStorage 키 이름("token" vs "jwtToken")을 실제 프로젝트에 맞춰 수정
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response; // 응답 데이터를 그대로 반환
  },
  (error) => {
    // 인증 실패 처리 (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // 로그인 상태가 만료된 경우 처리
      localStorage.removeItem("token"); 
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login"; // 로그인 페이지로 리디렉션
    }

    // 서버 에러 처리 (500 Internal Server Error)
    if (error.response && error.response.status === 500) {
      console.error("서버 오류:", error.response.data);
      alert("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
