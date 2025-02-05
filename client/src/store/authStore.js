import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {authAPI} from '../api/auth';

export const useAuthStore = create(
  persist(
    set => ({
      user: null,
      isAuthenticated: false,

      // 유저 프로필 가져오기
      fetchUserProfile: async () => {
        const accessToken = document.cookie.includes('accessToken');
        if (!accessToken) {
          // 로그인하지 않은 상태에서는 요청하지 않음
          console.log('로그인 상태가 아님: 프로필 요청 안함');
          return;
        }

        try {
          const user = await authAPI.getUserProfile();
          set({user, isAuthenticated: true});
        } catch (error) {
          console.error('유저 정보 가져오기 실패:', error);
          set({user: null, isAuthenticated: false});
        }
      },

      // 로그인 처리
      login: async userData => {
        try {
          await authAPI.loginUser(userData);
          await useAuthStore.getState().fetchUserProfile(); // 로그인 후 프로필 갱신
        } catch (error) {
          console.error(
            '로그인 실패:',
            error?.response?.data?.message || '알 수 없는 오류 발생'
          );
          set({user: null, isAuthenticated: false});
        }
      },

      // 로그아웃 처리
      logout: async () => {
        try {
          await authAPI.logoutUser(); // 서버에서 쿠키 삭제 처리
          set({user: null, isAuthenticated: false});
        } catch (error) {
          console.error(
            '로그아웃 실패:',
            error?.response?.data?.message || '알 수 없는 오류 발생'
          );
        }
      },

        // 인증 상태 확인
        checkAuth: async () => {
          const accessToken = document.cookie.includes('accessToken');
          if (!accessToken) {
            console.log('로그인 상태가 아님: 인증 요청 안함');
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
                console.error('자동 로그인 실패:', refreshError);
                set({ user: null, isAuthenticated: false });
              }
            }
          }
        }
      }),
      { name: 'auth-store' }
    )
  );
  