import { create } from "zustand";
import { authAPI } from "../api/auth";

// 브라우저에서 쿠키 수동 삭제 함수 추가
const clearCookies = () => {
  document.cookie = "accessToken=; Max-Age=0; path=/; domain=localhost; Secure";
  document.cookie = "refreshToken=; Max-Age=0; path=/; domain=localhost; Secure";
  console.log("쿠키가 수동으로 삭제되었습니다.");
};

// Zustand 상태 스토어 생성
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // 사용자 프로필 불러오기 (httpOnly 쿠키 기반 인증)
  fetchUserProfile: async () => {
    try {
      const user = await authAPI.getUserProfile();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error("프로필 정보를 불러오는 데 실패했습니다:", error?.response?.data?.message || error.message);
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그인 처리 (httpOnly 쿠키 기반)
  login: async (userData) => {
    try {
      await authAPI.loginUser(userData);
      await useAuthStore.getState().fetchUserProfile();
    } catch (error) {
      console.error("로그인 실패:", error?.response?.data?.message || "알 수 없는 오류 발생");
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그아웃 처리 (쿠키 삭제 + 상태 초기화)
  logout: async () => {
    set({ user: null, isAuthenticated: false });  // 상태 초기화 먼저 수행
    try {
      await authAPI.logoutUser();
      clearCookies();
    } catch (error) {
      console.error("로그아웃 실패:", error?.response?.data?.message || "알 수 없는 오류 발생");
    }
  },

  // 페이지 새로고침 시 인증 상태 확인
  checkAuth: async () => {
    try {
      await useAuthStore.getState().fetchUserProfile();
    } catch (error) {
      console.error("자동 로그인 실패:", error?.response?.data?.message || "알 수 없는 오류 발생");
      set({ user: null, isAuthenticated: false });
    }
  },
}));
