import api from '../axios'; // axios.js에서 공통 설정을 가져옴

const requestConfig = {
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-store', // 캐시 방지
    'Content-Type': 'application/json'
  }
};

let isRefreshing = false; // 리프레시 토큰 요청 상태 관리

// 공통 요청 처리 함수 (에러 핸들링 + 리프레시 토큰 처리 추가)
const handleRequest = async (requestPromise, errorMessage) => {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    const originalRequest = error.config; // 요청의 설정을 가져옴
    if (!originalRequest) {
      console.error('오류: 요청 객체가 없습니다.', error);
      throw new Error('요청 객체가 존재하지 않습니다.');
    }

    // 401 Unauthorized 처리 (리프레시 토큰 재발급)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true; // 재시도 방지 flag 설정
      isRefreshing = true;

      try {
        console.log('액세스 토큰 만료, 리프레시 토큰 요청 중...');
        await authAPI.refreshToken(); // 새 액세스 토큰 요청
        isRefreshing = false;
        return api(originalRequest); // 원래 요청 다시 시도
      } catch (refreshError) {
        console.error('리프레시 토큰 만료, 로그인 필요');
        authAPI.logoutUser();
        isRefreshing = false;
        throw refreshError;
      }
    }

    throw error.response?.data || new Error(errorMessage);
  }
};

// 브라우저 쿠키 수동 삭제
const clearCookiesManually = () => {
  document.cookie = 'accessToken=; Max-Age=0; path=/;';
  document.cookie = 'refreshToken=; Max-Age=0; path=/;';
  console.log('브라우저 쿠키 수동 삭제 완료');
};

export const authAPI = {
  registerUser: userData =>
    handleRequest(
      api.post('/auth/register', userData, requestConfig),
      '회원가입 요청 중 오류 발생'
    ),

  loginUser: loginData =>
    handleRequest(
      api.post('/auth/login', loginData, requestConfig),
      '로그인 요청 중 오류 발생'
    ),

  logoutUser: async () => {
    await handleRequest(
      api.post('/auth/logout', {}, requestConfig),
      '로그아웃 요청 중 오류 발생'
    );
    clearCookiesManually();
  },

  getUserProfile: () =>
    handleRequest(api.get('/auth/profile', requestConfig), '프로필 조회 중 오류 발생'),

  checkDuplicate: data => {
    if (!data || Object.values(data).every(val => !val.trim())) {
      return Promise.reject({message: '입력된 값이 없습니다.'});
    }
    return handleRequest(
      api.post('/auth/check-duplicate', data, requestConfig),
      '중복 확인 중 오류 발생'
    );
  },

  updateProfile: userData =>
    handleRequest(
      api.put('/auth/profile/update', userData, requestConfig),
      '프로필 수정 중 오류 발생'
    ),

  changePassword: passwordData =>
    handleRequest(
      api.put('/auth/change-password', passwordData, requestConfig),
      '비밀번호 변경 중 오류 발생'
    ),

  //  비밀번호 찾기 요청에서만 withCredentials 제거
  forgotPassword: email =>
    handleRequest(
      api.post(
        '/auth/forgot-password',
        {email},
        {
          headers: {
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json'
          }
        }
      ),
      '비밀번호 찾기 요청 중 오류 발생'
    ),

  resetPassword: resetData =>
    handleRequest(
      api.post('/auth/reset-password', resetData, requestConfig),
      '비밀번호 변경 중 오류 발생'
    ),

  refreshToken: async () => {
    try {
      console.log('리프레시 토큰 갱신 중...');
      const response = await handleRequest(
        api.post('/auth/refresh-token', {}, requestConfig),
        '리프레시 토큰 갱신 중 오류 발생'
      );
      return response;
    } catch (error) {
      console.error('리프레시 토큰 갱신 실패');
      throw error;
    }
  },

  //  아이디 찾기 API 요청
  findUserId: async email => {
    console.log(' 아이디 찾기 요청 시작:', email); //  요청 확인
    try {
      const response = await handleRequest(
        api.post('/auth/find-userid', {email}, requestConfig),
        '아이디 찾기 요청 중 오류 발생'
      );
      console.log(' 아이디 찾기 API 응답:', response); //  서버 응답 확인
      return response;
    } catch (error) {
      console.error(' 아이디 찾기 API 요청 실패:', error.response?.data || error); //  오류 로그 출력
      throw error;
    }
  },

  // ✅ 인증 코드 검증 API 추가
  verifyCode: async ({email, code}) => {
    console.log(' [클라이언트] 인증 코드 검증 요청:', email, code); // 디버깅
    return handleRequest(
      api.post('/auth/verify-code', {email, code}, requestConfig),
      '인증 코드 확인 요청 중 오류 발생'
    );
  }
};

export default authAPI;
