import {useEffect, useState} from 'react';
import {authAPI} from '../../api/auth/auth'; // auth.js로부터 API 호출

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
  const [isChannelLoaded, setIsChannelLoaded] = useState(false); // ChannelIO가 로드됐는지 확인

  // 사용자 프로필을 설정하는 함수
  const fetchUserProfile = async () => {
    try {
      const token = getCookie('accessToken');
      console.log('토큰 확인:', token);
      if (token) {
        const userResponse = await authAPI.getUserProfile(); // getUserProfile을 호출하여 사용자 정보 받아오기
        console.log('UserProfile:', userResponse);
        setUserProfile(
          userResponse || {
            username: '방문자',
            email: 'guest@example.com',
            id: 'guest'
          }
        ); // 상태 업데이트
      } else {
        setUserProfile({
          username: '방문자',
          email: 'guest@example.com',
          id: 'guest'
        }); // 로그인되지 않은 경우 기본값 설정
      }
    } catch (error) {
      console.log('사용자 정보 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    const loadChannelTalk = async () => {
      try {
        // 사용자 정보 가져오기
        await fetchUserProfile();

        // 채널톡 스크립트 동적 추가
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';

        script.onload = () => {
          setIsChannelLoaded(true); // 스크립트가 로드되었을 때 상태 업데이트
          console.log('채널톡 스크립트 로드 완료');
        };

        script.onerror = () => {
          console.error('채널톡 스크립트 로드 실패!');
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('채널톡 초기화 중 오류 발생:', error);
      }
    };

    loadChannelTalk(); // 사용자 정보 가져오고 채널톡 초기화
  }, []); // 한 번만 실행되도록 변경

  useEffect(() => {
    if (isChannelLoaded && userProfile.id !== 'guest') {
      const checkChannelIOInterval = setInterval(() => {
        if (window.ChannelIO) {
          clearInterval(checkChannelIOInterval); // 로드되면 반복 종료
          console.log('ChannelIO 로드됨:', window.ChannelIO);

          const userEmail = userProfile.email || 'guest@example.com'; // 사용자 이메일이 없으면 기본값 사용
          window.ChannelIO('boot', {
            pluginKey: '7761c1dd-62ee-4c88-a887-3625d73200e0',
            memberId: userProfile.id, // 로그인 시 ID, guest일 경우 guest
            profile: {
              name: userProfile.username, // 사용자 이름
              email: userEmail // 이메일
            }
          });
        } else {
          console.log('ChannelIO 로드 대기 중...');
        }
      }, 500); // 0.5초마다 확인

      // 클린업: 컴포넌트 언마운트 시 인터벌 종료
      return () => clearInterval(checkChannelIOInterval);
    }
  }, [isChannelLoaded, userProfile]); // `isChannelLoaded`와 `userProfile`이 변경될 때마다 확인

  return null;
};

export default ChannelTalk;
