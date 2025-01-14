import React from "react";
import { NavLink } from "react-router-dom";
import "./styles/Sidebar.css"; // 스타일 추가

const Sidebar = ({ handleLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="../../images/instartlogo.svg" alt="Logo" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className="nav-item">
          <i className="fas fa-home"></i> 메인페이지
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <i className="fas fa-user"></i> 내정보
        </NavLink>
        <NavLink to="/allUser" className="nav-item">
          <i className="fas fa-users"></i> 사용자 목록
        </NavLink>
        <NavLink to="/messages" className="nav-item">
          <i className="fas fa-envelope"></i> 메시지
        </NavLink>
        <NavLink to="/notifications" className="nav-item">
          <i className="fas fa-envelope"></i>알림
        </NavLink>
        <button className="nav-item logout" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> 로그아웃
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;