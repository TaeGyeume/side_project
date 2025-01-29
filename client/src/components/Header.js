import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";  

const Header = () => {
  const { user, isAuthenticated, fetchUserProfile, logout } = useAuthStore();
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 프로필 불러오기
  useEffect(() => {
    if (!user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  // 로그아웃 처리 (쿠키 삭제 + 상태 초기화 + 리디렉션)
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error.message || "알 수 없는 오류 발생");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/main">Our Real Trip</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/main">메인</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/accommodations/search">숙소 검색</Link>
            </li>
            {isAuthenticated && user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">프로필</Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <span className="nav-link text-primary fw-bold">
                    {user?.username}님
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-danger" onClick={handleLogout}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">로그인</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
