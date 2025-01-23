import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";  // Zustand 스토어 가져오기

const Header = () => {
  const { user, isAuthenticated, fetchUserProfile, logout } = useAuthStore();  // Zustand에서 상태 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();  // 컴포넌트 마운트 시 사용자 정보 불러오기
  }, [fetchUserProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link className="navbar-brand" to="/main">
          Our Real Trip
        </Link>

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
              <Link className="nav-link" to="/main">
                메인
              </Link>
            </li>
            {isAuthenticated && user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    프로필
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <span className="nav-link text-primary fw-bold">
                    {user.username}님
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
                <Link className="nav-link" to="/login">
                  로그인
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
