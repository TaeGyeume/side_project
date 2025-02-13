import {useEffect, useState} from 'react';
import {authAPI} from '../../api/auth/auth'; // auth.js에서 API 호출

const ChannelTalk = () => {
  const [userProfile, setUserProfile] = useState(null); // 사용자 프로필 상태
  const [isChannelLoaded, setIsChannelLoaded] = useState(false); // 채널톡 로드 상태

  // 사용자 프로필을 가져오는 함수
  const fetchUserProfile = async () => {
    try {
      const userResponse = await authAPI.getUserProfile(); // getUserProfile 실행
      // console.log('✅ getUserProfile 응답:', userResponse);

      if (userResponse && userResponse.email) {
        setUserProfile(userResponse); // 정상적인 응답이면 상태 업데이트
      } else {
        console.warn('⚠️ getUserProfile 응답이 올바르지 않음:', userResponse);
        setUserProfile({
          username: '방문자',
          email: 'guest@example.com',
          id: 'guest'
        });
      }
    } catch (error) {
      // 로그인 상태가 아니면 401 에러가 발생할 수 있음 -> guest 프로필로 처리
      if (error.response && error.response.status === 401) {
        console.warn('401 Unauthorized - 게스트 프로필 적용');
      } else {
        console.error('❌ 사용자 정보 가져오기 실패:', error);
      }
      setUserProfile({
        username: '방문자',
        email: 'guest@example.com',
        id: 'guest'
      });
    }
  };

  useEffect(() => {
    const loadChannelTalk = async () => {
      // 로그인 여부 확인 (예시: localStorage의 accessToken 존재 여부)
      const isAuthenticated = !!localStorage.getItem('accessToken');

      if (isAuthenticated) {
        // 로그인 된 경우에만 API를 호출하여 사용자 프로필 가져오기
        await fetchUserProfile();
      } else {
        // 비로그인 상태이면 게스트 프로필을 바로 설정
        // console.log('로그인되지 않음 - 게스트 프로필 적용');
        setUserProfile({
          username: '방문자',
          email: 'guest@example.com',
          id: 'guest'
        });
      }

      // 채널톡 스크립트 추가
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

      script.onload = () => {
        // console.log('✅ 채널톡 스크립트 로드 완료');
        setIsChannelLoaded(true);
      };

      script.onerror = () => {
        console.error('❌ 채널톡 스크립트 로드 실패!');
      };

      document.body.appendChild(script);
    };

    loadChannelTalk();
  }, []);

  useEffect(() => {
    // console.log('🔄 userProfile 상태 업데이트:', userProfile);

    // ChannelIO를 초기화: userProfile이 설정되어 있다면 (게스트라도) 초기화 진행
    if (isChannelLoaded && userProfile) {
      const initializeChannelTalk = () => {
        if (window.ChannelIO) {
          // console.log('✅ ChannelIO 로드됨, 채널톡 초기화 실행');
          const userEmail = userProfile.email || 'guest@example.com';
          window.ChannelIO('boot', {
            pluginKey: '7761c1dd-62ee-4c88-a887-3625d73200e0',
            memberId: userProfile.id,
            profile: {
              name: userProfile.username,
              email: userEmail
            }
          });
        } else {
          // console.log('⏳ ChannelIO 로드 대기 중...');
          setTimeout(initializeChannelTalk, 500);
        }
      };

      initializeChannelTalk();
    }
  }, [isChannelLoaded, userProfile]);

  return null;
};

export default ChannelTalk;
