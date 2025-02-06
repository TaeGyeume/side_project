import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      // 유저 프로필 가져오기
      fetchUserProfile: async () => {
        try {
          const user = await authAPI.getUserProfile();
          // console.log('✅ 프로필 불러오기 성공:', user);
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          console.error('❌ 프로필 불러오기 실패:', error);
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      // 상태 직접 업데이트 함수 추가
      setAuthState: (authState) => {
        set(authState);
      },


      // 로그인 처리
      login: async (userData) => {
        try {
          await authAPI.loginUser(userData);
          await get().fetchUserProfile();
        } catch (error) {
          console.error('로그인 실패:', error?.response?.data?.message || error.message);
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      // 로그아웃 처리
      logout: async () => {
        try {
          await authAPI.logoutUser();
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('로그아웃 실패:', error?.response?.data?.message || error.message);
          throw error;
        }
      },

      // 인증 상태 확인
      checkAuth: async () => {
        if (!get().isAuthenticated) {
          // console.log('❌ 로그인 상태가 아님, 프로필 요청 중단');
          return;  // 로그인 상태가 아닐 때는 프로필 요청 중단
        }
        try {
          await get().fetchUserProfile();
        } catch (error) {
          if (error.response?.status === 401) {
            try {
              await authAPI.refreshToken();
              await get().fetchUserProfile();
            } catch (refreshError) {
              console.error('❌ 토큰 갱신 실패:', refreshError);
              set({ user: null, isAuthenticated: false });
              throw refreshError;
            }
          }
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
);
