import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {authAPI} from '../api/auth';

// 브라우저에서 쿠키 수동 삭제 함수 (로컬 환경 고려)
const clearCookies = () => {
  document.cookie = 'accessToken=; Max-Age=0; path=/;';
  document.cookie = 'refreshToken=; Max-Age=0; path=/;';
};

export const useAuthStore = create(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      fetchUserProfile: async () => {
        try {
          const user = await authAPI.getUserProfile();
          console.log('유저 정보:', user);  // ✅ 역할(role) 출력 확인
          set({ user, isAuthenticated: true });
          return user;
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          return null;
        }
      },

      login: async userData => {
        try {
          await authAPI.loginUser(userData);
          await useAuthStore.getState().fetchUserProfile();
        } catch (error) {
          console.error(
            '로그인 실패:',
            error?.response?.data?.message || '알 수 없는 오류 발생'
          );
          set({user: null, isAuthenticated: false});
        }
      },

      logout: async () => {
        try {
          await authAPI.logoutUser();
          clearCookies();
          set({user: null, isAuthenticated: false});
        } catch (error) {
          console.error(
            '로그아웃 실패:',
            error?.response?.data?.message || '알 수 없는 오류 발생'
          );
        }
      },

      checkAuth: async () => {
        // 로그인 쿠키가 없는 경우 요청 생략
        if (
          !document.cookie.includes('accessToken=') &&
          !document.cookie.includes('refreshToken=')
        ) {
          return;
        }

        try {
          await useAuthStore.getState().fetchUserProfile();
        } catch (error) {
          if (error.response?.status === 401) {
            try {
              await authAPI.refreshToken();
              await useAuthStore.getState().fetchUserProfile();
            } catch (refreshError) {
              console.error(
                '자동 로그인 실패:',
                refreshError?.response?.data?.message || '알 수 없는 오류'
              );
              clearCookies();
              set({user: null, isAuthenticated: false});
            }
          } else {
            clearCookies();
            set({user: null, isAuthenticated: false});
          }
        }
      }
    }),
    {name: 'auth-store'}
  )
);
