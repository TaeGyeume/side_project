import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {authAPI} from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      // ✅ 유저 프로필 가져오기
      fetchUserProfile: async () => {
        try {
          console.log('🔍 프로필 요청 시작');
          const user = await authAPI.getUserProfile();
          console.log('✅ 프로필 불러오기 성공:', user);
          set({user, isAuthenticated: true});
          return user;
        } catch (error) {
          console.error('❌ 프로필 불러오기 실패:', error);
          set({user: null, isAuthenticated: false});
          throw error;
        }
      },

      // ✅ 상태 직접 업데이트 함수 추가
      setAuthState: authState => {
        set(authState);
      },

      // ✅ 로그인 처리
      login: async userData => {
        try {
          console.log('🔑 로그인 요청:', userData);
          await authAPI.loginUser(userData);
          console.log('✅ 로그인 성공, 프로필 불러오기 시작');
          await get().fetchUserProfile();
        } catch (error) {
          console.error(
            '❌ 로그인 실패:',
            error?.response?.data?.message || error.message
          );
          set({user: null, isAuthenticated: false});
          throw error;
        }
      },

      // ✅ 로그아웃 처리
      logout: async () => {
        try {
          console.log('🚪 로그아웃 요청 시작');
          await authAPI.logoutUser();
          clearCookies(); // 🔥 브라우저 쿠키 삭제
          set({user: null, isAuthenticated: false});
          console.log('✅ 로그아웃 완료, 상태 초기화');
        } catch (error) {
          console.error(
            '❌ 로그아웃 실패:',
            error?.response?.data?.message || error.message
          );
          throw error;
        }
      },

      // ✅ 인증 상태 확인 (자동 로그인 유지)
      checkAuth: async () => {
        if (!get().isAuthenticated) {
          console.log('❌ 로그인 상태가 아님, 프로필 요청 중단');
          return;
        }
        try {
          console.log('🔄 인증 상태 확인: 프로필 불러오기 시작');
          await get().fetchUserProfile();
        } catch (error) {
          if (error.response?.status === 401) {
            console.log('⚠️ 401 Unauthorized 발생, 리프레시 토큰 요청 시도');
            try {
              await authAPI.refreshToken();
              console.log('✅ 리프레시 토큰 요청 성공, 프로필 다시 불러오기');
              await get().fetchUserProfile();
            } catch (refreshError) {
              console.error('❌ 리프레시 토큰 실패:', refreshError);
              clearCookies(); // 🔥 브라우저 쿠키 삭제
              set({user: null, isAuthenticated: false});
              throw refreshError;
            }
          }
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: state => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
);

// ✅ 브라우저 쿠키 삭제 함수 개선
const clearCookies = () => {
  console.log('🗑 브라우저 쿠키 삭제 시작');

  // 모든 쿠키 삭제
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [name] = cookie.split('=');
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
  }

  console.log('✅ 브라우저 쿠키 삭제 완료');
};
