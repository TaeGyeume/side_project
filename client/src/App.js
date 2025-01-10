import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Profile from "./pages/Profile"; // 내 정보 페이지
import Login from "./pages/Login"; // 로그인 페이지
import Register from "./components/Register"; // 회원가입 페이지
import Footer from "./components/Footer"; // 푸터
import UserList from "./pages/UserList"; // 사용자 목록
import ChatRoom from "./pages/ChatRoom"; // 채팅방
import AllUserList from "./components/AllUserList"; // 전체 사용자 목록
import Sidebar from "./components/Sidebar"; // 사이드바 컴포넌트 추가
import axios from "axios";
import "./App.css"; // 전체 레이아웃 스타일

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // 토큰 저장
    fetchCurrentUser(newToken); // 사용자 정보 로드
  };

  const handleLogout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token"); // 로컬 스토리지에서 토큰 제거
  }, []);

  const fetchCurrentUser = useCallback(
    async (authToken) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        handleLogout(); // 사용자 정보 로드 실패 시 로그아웃
      }
    },
    [handleLogout]
  );

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token); // 토큰이 있는 경우 사용자 정보 로드
    }
  }, [token, fetchCurrentUser]);

  return (
    <Router>
      <div className="app">
        {/* 로그인된 사용자만 사이드바 표시 */}
        {token && <Sidebar handleLogout={handleLogout} />}
        <div className={token ? "content-with-sidebar" : "content"}>
          <nav>
            <ul className="top-nav">
              {!token && (
                <>
                  <li>
                    <Link to="/">메인페이지</Link>
                  </li>
                  <li>
                    <Link to="/register">회원가입</Link>
                  </li>
                  <li>
                    <Link to="/login">로그인</Link>
                  </li>
                </>
              )}
              {token && (
                <>
                  <li>
                    <Link to="/">메인페이지</Link>
                  </li>
                  <li>
                    <Link to="/profile">내정보</Link>
                  </li>
                  <li>
                    <Link to="/allUser">전체 사용자 목록</Link>
                  </li>
                  <li>
                    <Link to="/messages">메시지</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<h1>메인페이지! 이희진이형민김민혁</h1>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/profile"
              element={token ? <Profile /> : <p>Please log in to view this page.</p>}
            />
            <Route path="/allUser" element={<AllUserList />} />
            <Route
              path="/messages"
              element={token ? <UserList currentUser={currentUser} /> : <p>Please log in to view this page.</p>}
            />
            <Route
              path="/chat/:roomId"
              element={token ? <ChatRoom currentUser={currentUser} /> : <p>Please log in to view this page.</p>}
            />
          </Routes>
          <Footer /> {/* 푸터 */}
        </div>
      </div>
    </Router>
  );
};

export default App;
