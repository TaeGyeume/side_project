import api from "../axios";  // axios.js에서 공통 설정을 가져옴

// 사용자 프로필 조회 API 호출
export const getUserProfile = () => api.get("/auth/profile");

// 사용자 프로필 업데이트 API 호출
export const updateUserProfile = (profileData) => api.put("/auth/update-profile", profileData);
