import { create } from "zustand";
import API from "../api/axios";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // 사용자 프로필 가져오기
  fetchUserProfile: async () => {
    try {
      const response = await API.get("/auth/profile");
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem("accessToken");
    }
  },

  // 로그인 처리
  login: (userData) => {
    localStorage.setItem("accessToken", userData.accessToken);
    set({ user: userData.user, isAuthenticated: true });
  },

  // 로그아웃 처리
  logout: async () => {
    await API.post("/auth/logout");
    localStorage.removeItem("accessToken");
    set({ user: null, isAuthenticated: false });
  },

  // 새로고침 시 자동 로그인 체크
  checkAuth: async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      await useAuthStore.getState().fetchUserProfile();
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
