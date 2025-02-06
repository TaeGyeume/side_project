import React from 'react';

const SocialLoginButtons = () => {
  // 페이스북 로그인 핸들러
  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  // 네이버 로그인 핸들러
  const handleNaverLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/naver';
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/kakao';
  };

  return (
    <div>
      {/* 페이스북 로그인 버튼 */}
      <button onClick={handleFacebookLogin} className="btn btn-primary" style={{ marginBottom: '10px' }}>
        Facebook으로 로그인
      </button>
      <br />
      {/* 네이버 로그인 버튼 */}
      <button onClick={handleNaverLogin} className="btn btn-success">
        Naver로 로그인
      </button>
      {/* 카카오 로그인 버튼 */}
      <button
        onClick={handleKakaoLogin}
        className="btn btn-warning"
      >
        Kakao로 로그인
      </button>

    </div>
  );
};

export default SocialLoginButtons;
