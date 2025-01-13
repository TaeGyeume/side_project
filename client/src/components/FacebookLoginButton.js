import React from "react";

const FacebookLoginButton = () => {
  const handleLogin = () => {
    try {
      // 서버의 Facebook 로그인 엔드포인트로 리디렉션
      window.location.href = "http://localhost:5000/auth/facebook";
    } catch (error) {
      console.error("Facebook login error:", error);
      alert("Facebook 로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        backgroundColor: "#4267B2",
        color: "white",
        padding: "10px 20px",
        fontSize: "16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Login with Facebook
    </button>
  );
};

export default FacebookLoginButton;
