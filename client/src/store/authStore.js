import { create } from "zustand";
import { authAPI } from "../api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // 사용자 프로필 불러오기 (로그인 시 호출)
  fetchUserProfile: async () => {
    try {
      const response = await authAPI.getUserProfile();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그인 처리
  login: async (userData) => {
    localStorage.setItem("accessToken", userData.accessToken);
    set({ user: userData.user, isAuthenticated: true });

    // 로그인 후 즉시 사용자 프로필 로드
    await useAuthStore.getState().fetchUserProfile();
  },

  // 로그아웃 처리
  logout: async () => {
    try {
      await authAPI.logoutUser();
      localStorage.removeItem("accessToken");
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  },

  // 초기 인증 상태 확인 (페이지 새로고침 시)
  checkAuth: () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      set({ isAuthenticated: true });
      useAuthStore.getState().fetchUserProfile();
    }
  },
}));
