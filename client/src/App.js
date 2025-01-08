import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Profile from "./pages/Profile"; // 내 정보 페이지
import Login from "./pages/Login"; // 로그인 페이지
import Register from "./components/Register"; // 회원가입 페이지
import UserList from "./pages/UserList";
import ChatRoom from "./pages/ChatRoom";
import axios from "axios";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (newToken) => {
      setToken(newToken);
      localStorage.setItem("token", newToken); // 토큰 저장
      fetchCurrentUser(newToken); // 사용자 정보 로드
  };

  // `handleLogout`을 useCallback으로 감싸기
  const handleLogout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
  }, []); // 의존성 배열을 비워서 항상 동일한 함수 유지

  // `fetchCurrentUser`를 `useCallback`으로 래핑
  const fetchCurrentUser = useCallback(
    async (authToken) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        handleLogout();
      }
    },
    [handleLogout] // 의존성 배열에 `handleLogout` 추가
  );

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token); // 토큰이 있으면 사용자 정보 로드
    }
  }, [token, fetchCurrentUser]); // `fetchCurrentUser`를 의존성 배열에 추가

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <nav>
        <ul>
          {!token && ( // 로그인하지 않았을 때 표시되는 메뉴
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
          {token && ( // 로그인했을 때 표시되는 메뉴
            <>
              <li>
                <Link to="/">메인페이지</Link>
              </li>
              <li>
                <Link to="/profile">내정보</Link>
              </li>
              <li>
                <Link to="/messages">메시지</Link>
              </li>
              <li>
                <button onClick={handleLogout}>로그아웃</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<h1>메인페이지!이형민</h1>} // 메인 페이지
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/profile"
          element={token ? <Profile /> : <p>Please log in to view this page.</p>}
        />
        {/* 로그인한 사용자만 메시지 페이지에 접근 가능 */}
        <Route
          path="/messages"
          element={token ? <UserList currentUser={currentUser} /> : <p>Please log in to view this page.</p>}
        />
        {/* 특정 채팅방에 접근 */}
        <Route
          path="/chat/:roomId"
          element={token ? <ChatRoom currentUser={currentUser} /> : <p>Please log in to view this page.</p>}
        />
      </Routes>
    </Router>
  );
};

export default App;
