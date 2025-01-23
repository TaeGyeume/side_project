import axios from "axios";

// Axios 인스턴스 생성 (백엔드 API 기본 설정)
const API = axios.create({
  baseURL: "http://localhost:5000/api",  // 백엔드 API 주소
  withCredentials: true,  // 쿠키 허용 (JWT 인증 사용 시 필수)
});

// 사용자 프로필 조회 API 호출
export const getUserProfile = () => API.get("/auth/profile");

// 사용자 프로필 업데이트 API 호출
export const updateUserProfile = (profileData) => API.put("/auth/update-profile", profileData);
