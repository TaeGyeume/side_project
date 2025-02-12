import {useEffect, useState} from 'react';
import {authAPI} from '../../api/auth/auth'; // auth.js로부터 API 호출

// 쿠키에서 accessToken을 가져오는 함수 // 깃허브 vscode 시간되돌리기
// 쿠키에서 accessToken을 가져오는 함수

const getCookie = name => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const ChannelTalk = () => {
  const [userProfile, setUserProfile] = useState({
    username: '방문자',
    email: 'guest@example.com',
    id: 'guest'
  }); // 사용자 프로필 상태 기본값 설정

  useEffect(() => {
    const loadChannelTalk = async () => {
      try {
        // 로그인 상태 확인: 쿠키에서 accessToken을 가져옴
        const token = getCookie('accessToken'); // 쿠키에서 가져오기
        console.log('토큰 확인:', token); // 토큰이 정상적으로 저장되어 있는지 확인

        // 로그인된 상태일 경우 사용자 정보 가져오기
        if (token) {
          try {
            const userResponse = await authAPI.getUserProfile(); // getUserProfile을 호출하여 사용자 정보 받아오기
            console.log('UserProfile:', userResponse); // 사용자 정보 로그
            setUserProfile(
              userResponse || {
                username: '방문자',
                email: 'guest@example.com',
                id: 'guest'
              }
            ); // 사용자 정보가 없으면 기본값 사용
          } catch (error) {
            console.log('사용자 정보 가져오기 실패:', error);
          }
        } else {
          setUserProfile({username: '방문자', email: 'guest@example.com', id: 'guest'}); // 로그인되지 않은 경우 기본값 설정
        }

        // 채널톡 초기화 함수
        const initializeChannelTalk = () => {
          const userEmail = userProfile.email || 'guest@example.com'; // 사용자 이메일이 없으면 기본값 사용
          console.log('채널톡 초기화: ', userProfile.username, userProfile.email); // 초기화 전에 로그 추가
          if (window.ChannelIO) {
            window.ChannelIO('boot', {
              pluginKey: '7761c1dd-62ee-4c88-a887-3625d73200e0',
              memberId: userProfile.id, // 로그인 시 ID, guest일 경우 guest
              profile: {
                name: userProfile.username, // 사용자 이름
                email: userEmail // 이메일
              }
            });
          } else {
            console.error('ChannelIO 로드 실패!');
          }
        };

        // `window.ChannelIO`가 로드되었는지 확인하고, 없으면 일정 시간마다 확인
        if (window.ChannelIO) {
          initializeChannelTalk(); // 채널톡 초기화
        } else {
          let attempts = 0;
          const maxAttempts = 10;
          const checkInterval = setInterval(() => {
            if (window.ChannelIO) {
              initializeChannelTalk(); // 채널톡 초기화
              clearInterval(checkInterval); // 채널톡이 로드되면 인터벌 종료
            } else if (attempts >= maxAttempts) {
              console.error('❌ 채널톡 스크립트 로드 실패!');
              clearInterval(checkInterval); // 시도 횟수가 초과되면 종료
            }
            attempts++;
          }, 500); // 0.5초마다 확인
        }
      } catch (error) {
        console.error('채널톡 초기화 중 오류 발생:', error);
      }
    };

    loadChannelTalk(); // 사용자 정보 가져오고 채널톡 초기화

    // 채널톡 스크립트 동적 추가
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

    script.onload = loadChannelTalk; // 스크립트 로드 후 사용자 정보 적용
    script.onerror = () => {
      console.error('채널톡 스크립트 로드 실패!');
    };

    document.body.appendChild(script);

    // 클린업: 컴포넌트 언마운트 시 채널톡 종료
    return () => {
      if (window.ChannelIO) {
        window.ChannelIO('shutdown');
      }
    };
  }, []); // 의존성 배열에서 userProfile을 제거하여 useEffect가 한 번만 실행되도록 변경

  return null;
};

export default ChannelTalk;
