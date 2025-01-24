import { create } from "zustand";
import { authAPI } from "../api/auth";

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
      console.error("프로필 정보를 불러오는 데 실패했습니다:", error.response?.message || error.message);
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그인 처리 (httpOnly 쿠키 기반)
  login: async (userData) => {
    try {
      await authAPI.loginUser(userData);
      set({ isAuthenticated: true });

      // 상태 내 fetchUserProfile 호출
      await useAuthStore.getState().fetchUserProfile();
    } catch (error) {
      console.error("로그인 실패:", error.response?.message || "알 수 없는 오류 발생");
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그아웃 처리 (쿠키 삭제)
  logout: async () => {
    try {
      await authAPI.logoutUser();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("로그아웃 실패:", error.response?.message || "알 수 없는 오류 발생");
    }
  },

  // 페이지 새로고침 시 인증 상태 확인
  checkAuth: async () => {
    try {
      await useAuthStore.getState().fetchUserProfile();
    } catch (error) {
      console.error("자동 로그인 실패:", error.response?.message || "알 수 없는 오류 발생");
      set({ user: null, isAuthenticated: false });
    }
  },
}));
