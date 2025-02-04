import React from 'react';

const SocialLoginButtons = () => {
  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/facebook';
  };

  return (
    <div>
      <button onClick={handleFacebookLogin} className="btn btn-primary">
        Facebook으로 로그인
      </button>
    </div>
  );
};

export default SocialLoginButtons;
