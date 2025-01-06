import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Profile from "./pages/Profile"; // 내 정보 페이지
import Login from "./pages/Login"; // 로그인 페이지
import Register from "./components/Register"; // 회원가입 페이지
import Login from "./components/Login";
import UserList from "./components/UserList";
import ChatRoom from "./components/ChatRoom";
import AddUser from "./components/AddUser";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
      setToken(newToken);
      localStorage.setItem("token", newToken); // 토큰 저장
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token"); // 토큰 제거
  };

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Stored user in localStorage:", storedUser); // 디버깅
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
                            <li>
                              <Link to="/messages">Messages</Link>
                            </li>
                        </>
                    )}
                    {token && ( // 로그인했을 때 표시되는 메뉴
                        <>
                            <li>
                                <Link to="/profile">내정보</Link>
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
                    element={<h1>메인페이지!</h1>} // 메인 페이지
                />
                <Route path="/messages" element={<UserList currentUser={currentUser} />} />
                <Route path="/chat/:roomId" element={<ChatRoom currentUser={currentUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route
                    path="/profile"
                    element={token ? <Profile /> : <p>Please log in to view this page.</p>}
                />
            </Routes>
        </Router>
    );
};

export default App;
