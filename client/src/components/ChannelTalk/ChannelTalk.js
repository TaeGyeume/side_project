import {useEffect, useState} from 'react';
import {authAPI} from '../../api/auth/auth'; // auth.js에서 API 호출

const ChannelTalk = () => {
  const [userProfile, setUserProfile] = useState(null); // 사용자 프로필 상태
  const [isChannelLoaded, setIsChannelLoaded] = useState(false); // 채널톡 로드 상태

  // ✅ 사용자 프로필을 가져오는 함수 (쿠키 확인 없이 항상 실행)
  const fetchUserProfile = async () => {
    try {
      const userResponse = await authAPI.getUserProfile(); // getUserProfile 실행
      console.log('✅ getUserProfile 응답:', userResponse);

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
      console.error('❌ 사용자 정보 가져오기 실패:', error);
      setUserProfile({
        username: '방문자',
        email: 'guest@example.com',
        id: 'guest'
      });
    }
  };

  useEffect(() => {
    const loadChannelTalk = async () => {
      try {
        // ✅ 사용자 정보 가져오기 (쿠키 확인 없이 실행)
        await fetchUserProfile();

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
      } catch (error) {
        console.error('❌ 채널톡 초기화 중 오류 발생:', error);
      }
    };

    loadChannelTalk();
  }, []);

  useEffect(() => {
    console.log('🔄 userProfile 상태 업데이트:', userProfile);

    // `userProfile`이 업데이트된 후 실행
    if (isChannelLoaded && userProfile && userProfile.id !== 'guest') {
      const initializeChannelTalk = () => {
        if (window.ChannelIO) {
          console.log('✅ ChannelIO 로드됨, 채널톡 초기화 실행');

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
          console.log('⏳ ChannelIO 로드 대기 중...');
          setTimeout(initializeChannelTalk, 500);
        }
      };

      initializeChannelTalk();
    }
  }, [isChannelLoaded, userProfile]); // `isChannelLoaded`와 `userProfile`이 변경될 때마다 실행

  return null;
};

export default ChannelTalk;
