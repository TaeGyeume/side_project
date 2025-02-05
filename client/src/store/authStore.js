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
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          throw error;
        }
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
        if (!get().isAuthenticated) return; // 로그인 상태가 아니라면 프로필 
        try {
          await get().fetchUserProfile();
        } catch (error) {
          if (error.response?.status === 401) {
            try {
              await authAPI.refreshToken();
              await get().fetchUserProfile();
            } catch (refreshError) {
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
