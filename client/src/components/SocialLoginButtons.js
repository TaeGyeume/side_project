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

  // Google 로그인 핸들러
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };


  return (
    <div>
      {/* 페이스북 로그인 버튼 */}
      <button onClick={handleFacebookLogin} className="btn btn-primary" style={{ marginBottom: '10px' }}>
        Facebook으로 로그인
      </button>
      <br />

      {/* 네이버 로그인 버튼 */}
      <button onClick={handleNaverLogin} className="btn btn-success" style={{ marginBottom: '10px' }}>
        Naver로 로그인
      </button>
      <br />

      {/* 카카오 로그인 버튼 */}
      <button onClick={handleKakaoLogin} className="btn btn-warning" style={{ marginBottom: '10px' }}>
        Kakao로 로그인
      </button>
      <br />

      {/* Google 로그인 버튼 */}
      <button onClick={handleGoogleLogin} className="btn btn-danger">
        Google로 로그인
      </button>
    </div>
  );
};

export default SocialLoginButtons;