import {useEffect, useState} from 'react';
import {authAPI} from '../../api/auth/auth';

// ✅ 쿠키에서 특정 이름의 토큰이 존재하는지 확인하는 함수
const hasCookie = name =>
  document.cookie.split('; ').some(row => row.startsWith(`${name}=`));

const ChannelTalk = () => {
  const [userProfile, setUserProfile] = useState(null); // 사용자 프로필 상태
  const [isChannelLoaded, setIsChannelLoaded] = useState(false); // 채널톡 로드 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부

  // ✅ 로그인 여부를 확인하고 프로필을 불러오는 함수
  const loadUserProfile = async () => {
    console.log('🔍 사용자 프로필 요청 중...');

    // ✅ 1. `refreshToken`이 없으면 로그인하지 않은 상태로 처리 (API 요청 안 함)
    if (!hasCookie('refreshToken')) {
      console.warn('❌ 리프레시 토큰 없음. 게스트 프로필로 설정.');
      setUserProfile({username: '방문자', email: 'guest@example.com', id: 'guest'});
      setIsLoggedIn(false);
      return;
    }

    try {
      // ✅ 2. `refreshToken`이 있는 경우에만 액세스 토큰 갱신 요청
      await authAPI.refreshToken();
      console.log('✅ 액세스 토큰 갱신 성공');

      // ✅ 3. 갱신된 토큰으로 사용자 프로필 요청
      const userResponse = await authAPI.getUserProfile();
      console.log('✅ getUserProfile 응답:', userResponse);

      if (userResponse && userResponse.email) {
        setUserProfile(userResponse);
        setIsLoggedIn(true);
      } else {
        console.warn('⚠️ 사용자 정보가 없음, 게스트 상태 유지');
        setUserProfile({username: '방문자', email: 'guest@example.com', id: 'guest'});
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 가져오기 실패:', error);

      // ✅ 4. 401 Unauthorized 시, 자동으로 로그아웃 처리
      if (error.response?.status === 401) {
        console.warn('❌ 인증 실패, 게스트 상태 유지');
        setUserProfile({username: '방문자', email: 'guest@example.com', id: 'guest'});
        setIsLoggedIn(false);
      }
    }
  };

  // ✅ 초기 실행 시 로그인 상태 확인
  useEffect(() => {
    loadUserProfile();

    // ✅ 채널톡 스크립트 추가
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

    script.onload = () => {
      console.log('✅ 채널톡 스크립트 로드 완료');
      setIsChannelLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ 채널톡 스크립트 로드 실패!');
    };

    document.body.appendChild(script);
  }, []);

  // ✅ 로그인 후 `refreshToken`이 쿠키에 설정되었는지 감지 → 프로필 갱신
  useEffect(() => {
    const checkLoginStatus = setInterval(() => {
      if (hasCookie('refreshToken') && !isLoggedIn) {
        console.log('🔄 로그인 감지됨! 사용자 프로필 다시 요청');
        loadUserProfile();
        clearInterval(checkLoginStatus);
      }
    }, 1000); // 1초마다 확인 (최대 10초)

    return () => clearInterval(checkLoginStatus);
  }, [isLoggedIn]);

  useEffect(() => {
    console.log('🔄 userProfile 상태 업데이트:', userProfile);

    if (isChannelLoaded) {
      const initializeChannelTalk = () => {
        if (window.ChannelIO) {
          console.log('✅ ChannelIO 로드됨, 채널톡 초기화 실행');

          // ✅ 로그인 여부에 따라 다르게 설정
          if (isLoggedIn) {
            window.ChannelIO('boot', {
              pluginKey: '7761c1dd-62ee-4c88-a887-3625d73200e0', // 실제 플러그인 키 사용
              memberId: userProfile.id,
              profile: {
                name: userProfile.username,
                email: userProfile.email || 'guest@example.com'
              }
            });
          } else {
            // ✅ 로그인하지 않은 경우, 게스트 모드로 실행
            window.ChannelIO('boot', {
              pluginKey: '7761c1dd-62ee-4c88-a887-3625d73200e0'
            });
          }

          // ✅ 채널톡 UI 강제 로드
          window.ChannelIO('showMessenger');
        } else {
          console.log('⏳ ChannelIO 로드 대기 중...');
        }
      };

      // ✅ 500ms마다 `window.ChannelIO` 체크 (최대 10번 시도)
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = setInterval(() => {
        if (window.ChannelIO) {
          clearInterval(checkInterval);
          initializeChannelTalk();
        } else if (attempts >= maxAttempts) {
          console.error('❌ 채널톡 로드 실패: 5초 초과');
          clearInterval(checkInterval);
        }
        attempts++;
      }, 500);
    }
  }, [isChannelLoaded, isLoggedIn, userProfile]);

  return null;
};

export default ChannelTalk;
