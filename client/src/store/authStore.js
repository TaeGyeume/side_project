import { create } from "zustand";
import { authAPI } from "../api/auth";

// 브라우저에서 쿠키 수동 삭제 함수 (로컬 환경 고려)
const clearCookies = () => {
  document.cookie = "accessToken=; Max-Age=0; path=/;";
  document.cookie = "refreshToken=; Max-Age=0; path=/;";
  console.log("쿠키가 수동으로 삭제되었습니다.");
};

// Zustand 상태 스토어 생성
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // 사용자 프로필 불러오기
  fetchUserProfile: async () => {
    try {
      const user = await authAPI.getUserProfile();
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error(
        "프로필 정보를 불러오는 데 실패했습니다:",
        error?.response?.data?.message || error.message
      );
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그인 처리
  login: async (userData) => {
    try {
      await authAPI.loginUser(userData);
      await useAuthStore.getState().fetchUserProfile();
    } catch (error) {
      console.error(
        "로그인 실패:",
        error?.response?.data?.message || "알 수 없는 오류 발생"
      );
      set({ user: null, isAuthenticated: false });
    }
  },

  // 로그아웃 처리 (쿠키 삭제 + 상태 초기화)
  logout: async () => {
    try {
      await authAPI.logoutUser();
      clearCookies();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error(
        "로그아웃 실패:",
        error?.response?.data?.message || "알 수 없는 오류 발생"
      );
    }
  },

  // 페이지 새로고침 시 인증 상태 확인 및 갱신
  checkAuth: async () => {
    try {
      await authAPI.getUserProfile();
      set({ isAuthenticated: true });
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          // 리프레시 토큰을 통한 액세스 토큰 갱신
          await authAPI.refreshToken();
          await authAPI.getUserProfile();
          set({ isAuthenticated: true });
        } catch (refreshError) {
          console.error(
            "자동 로그인 실패:",
            refreshError?.response?.data?.message || "알 수 없는 오류"
          );
          clearCookies();
          set({ user: null, isAuthenticated: false });
        }
      } else {
        clearCookies();
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
