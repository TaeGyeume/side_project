import {useEffect} from 'react';

const ConsoleLogo = () => {
  useEffect(() => {
    console.log(
      `%c                                        _  _          _        
%c                                       | || |        (_)       
%c  ___   _   _  _ __  _ __   ___   __ _ | || |_  _ __  _  _ __  
%c / _ \\ | | | || '__|| '__| / _ \\ / _\` || || __|| '__|| || '_ \\ 
%c| (_) || |_| || |   | |   |  __/| (_| || || |_ | |   | || |_) |
%c \\___/  \\__,_||_|   |_|    \\___| \\__,_||_| \\__||_|   |_|| .__/ 
%c                                                        | |    
%c                                                        |_|    `,
      'color: #FF5733; font-weight: bold; font-size: 14px;', // 오렌지
      'color: #FFD700; font-weight: bold; font-size: 14px;', // 골드
      'color: #32CD32; font-weight: bold; font-size: 14px;', // 라임
      'color: #1E90FF; font-weight: bold; font-size: 14px;', // 블루
      'color: #8A2BE2; font-weight: bold; font-size: 14px;', // 퍼플
      'color: #FF69B4; font-weight: bold; font-size: 14px;', // 핑크
      'color: #FF4500; font-weight: bold; font-size: 14px;', // 레드 오렌지
      'color: #9400D3; font-weight: bold; font-size: 14px;' // 다크 퍼플
    );

    console.log(
      '%c🚀 Welcome to OurRealTrip! 🌍✈️',
      'color: #FF4500; font-weight: bold; font-size: 14px;'
    );

    console.log(
      '%c💡 Explore amazing travel deals at https://ourrealtrip.com/',
      'color: #1E90FF; font-weight: bold; font-size: 12px; text-decoration: underline;'
    );
  }, []);

  return null; // 화면에 렌더링할 필요 없음 (콘솔 출력만 수행)
};

export default ConsoleLogo;
