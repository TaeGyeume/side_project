import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Profile from "./pages/Profile"; // 내 정보 페이지
import Login from "./pages/Login"; // 로그인 페이지
import Register from "./components/Register"; // 회원가입 페이지
import Footer from "./components/Footer";
import ChatList from "./pages/ChatList";
import ChatRoom from "./pages/ChatRoom";
import AllUserList from "./components/AllUserList";
import Notifications from "./components/Notifications";
import { getIncomingFollowRequests } from "./api/followService";
import socket from "./socket";
import Sidebar from "./components/Sidebar";

import axios from "axios";
import "./App.css"; // 전체 레이아웃 스타일

const App = ({ currentUserId }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0); // 알림 개수 상태
  const [unreadMessageAlerts, setUnreadMessageAlerts] = useState(false);

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
    [handleLogout] // 의존성 배열에 `handleLogout` 추가
  );

  const fetchNotifications = useCallback(async () => {
    if (currentUser) {
      try {
        const notifications = await getIncomingFollowRequests(currentUser._id);
        if (Array.isArray(notifications)) {
          setNotificationCount(notifications.length);
        }

        else {
          console.error("Unexpected notifications format:", notifications);
          setNotificationCount(0); // 잘못된 형식인 경우 알림 개수 초기화
        }

      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotificationCount(0); // 요청 실패 시 알림 개수 초기화
      }
    }
  }, [currentUser]);

  const fetchUnreadMessages = useCallback(async () => {
    if (!currentUser) return;
  
    try {
      const response = await axios.get(`http://localhost:5000/api/messages/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data) {
        const alerts = response.data.reduce((acc, item) => {
          acc[item.roomId] = true;
          return acc;
        }, {});
        setUnreadMessageAlerts(alerts);
      }
    } catch (error) {
      console.error("Failed to fetch unread messages:", error);
      setUnreadMessageAlerts({});
    }
  }, [currentUser, token]);

  const handleRoomMessagesRead = (roomId) => {
    setUnreadMessageAlerts((prev) => ({
      ...prev,
      [roomId]: false,
    }));
    // 최신 상태 동기화
  fetchUnreadMessages();
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token); // 토큰이 있는 경우 사용자 정보 로드
    }
  }, [token, fetchCurrentUser]); // `fetchCurrentUser`를 의존성 배열에 추가

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser) {
      fetchNotifications();
      fetchUnreadMessages(); // 읽지 않은 메시지 확인
    }

    socket.on(`notification:${currentUser._id}`, () => {
      setNotificationCount((prev) => prev + 1);
    });

    socket.on(`messageUnread:${currentUser._id}`, () => {
      fetchUnreadMessages(); // 소켓 이벤트로 읽지 않은 메시지 업데이트
    });

    return () => {
      socket.off(`notification:${currentUser._id}`);
      socket.off(`messageUnread:${currentUser._id}`);
    };
  }, [currentUser, fetchNotifications, fetchUnreadMessages]);

  const resetNotificationCount = () => {
    setNotificationCount(0); // 알림 수 초기화
  };

  return (
    <Router>
      <div className="app">
        {/* 로그인된 사용자만 사이드바 표시 */}
        {token && <Sidebar handleLogout={handleLogout} />}
        <div className={token ? "content-with-sidebar" : "content"}>
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
                    <Link to="/notifications" onClick={resetNotificationCount}>
                      알림
                      {notificationCount > 0 && (
                        <span className="notification-badge">{notificationCount}</span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link to="/messages">
                      메시지{" "}
                      {Object.values(unreadMessageAlerts).some((alert) => alert) && (
                        <span className="alert-badge">⭕</span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>로그아웃</button>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<h1>메인페이지!</h1>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route
              path="/profile"
              element={token ? <Profile /> : <p>Please log in to view this page.</p>}
            />

            <Route
              path="/notifications"
              element={
                currentUser ? (
                  <Notifications currentUserId={currentUser._id}
                    onNotificationClear={resetNotificationCount}
                  />
                ) : (
                  <p>알림을 보려면 로그인하세요.</p>
                )
              }
            />
            <Route
              path="/allUser"
              element={
                currentUser ? (
                  <AllUserList currentUserId={currentUser._id} />
                ) : (
                  <p>사용자 정보를 불러오는 중...</p>
                )
              }
            />

            {/* 로그인한 사용자만 메시지 페이지에 접근 가능 */}
            <Route
              path="/messages"
              element={token ? <ChatList currentUser={currentUser} /> : <p>Please log in to view this page.</p>}
            />
            {/* 특정 채팅방에 접근 */}
            <Route
              path="/chat/:roomId"
              element={token ? <ChatRoom currentUser={currentUser} onMessagesRead={handleRoomMessagesRead} /> : <p>Please log in to view this page.</p>}
            />
          </Routes>
          <Footer /> {/* 푸터 추가 */}
        </div>
      </div>
    </Router>
  );
};

export default App;
