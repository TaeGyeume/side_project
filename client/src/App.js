import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./components/Register";
import UserList from "./pages/UserList";
import ChatRoom from "./pages/ChatRoom";
import AllUserList from "./components/AllUserList";
import axios from "axios";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // 토큰 저장
    fetchCurrentUser(newToken); // 사용자 정보 로드
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token"); // 토큰 제거
  };

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      handleLogout();
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token); // 토큰이 있으면 사용자 정보 로드
    }
  }, [token]);

  return (
    <Router>
      <nav>
        <ul>
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
              <li>
                <button onClick={handleLogout}>로그아웃</button>
              </li>
            </>
          )}
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<h1>메인페이지! 이희진</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/profile" element={token ? <Profile /> : <p>Please log in to view this page.</p>} />
        <Route path="/allUser" element={<AllUserList />} />
        <Route path="/messages" element={token ? <UserList currentUser={currentUser} /> : <p>Please log in to view this page.</p>} />
        <Route path="/chat/:roomId" element={token ? <ChatRoom currentUser={currentUser} /> : <p>Please log in to view this page.</p>} />
      </Routes>
    </Router>
  );
};

export default App;