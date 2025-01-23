import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api";  // API 가져오기

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getUserProfile();
        setUser(response.data);  // 사용자 데이터 설정
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await authAPI.logoutUser();
      localStorage.removeItem("accessToken");
      setUser(null); // 상태 업데이트
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
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
            {user ? (
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
