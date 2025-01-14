import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    if (window.FB) {
        window.FB.logout(() => {
          console.log("Facebook 세션 로그아웃 완료");
        });
      }
    // JWT 제거
    localStorage.removeItem("jwtToken");
    alert("로그아웃되었습니다.");

    // onLogout 콜백 호출 (로그인 상태 초기화)
    if (onLogout) {
      onLogout();
    }

    // 로그인 페이지로 리디렉션
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: "#dc3545",
        color: "white",
        padding: "10px 20px",
        fontSize: "16px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      로그아웃
    </button>
  );
};

export default LogoutButton;
