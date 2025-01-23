import React, { useEffect, useState } from 'react';
import api from './api/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthPages, Main, UserPages } from './pages';
import Header from "./components/Header";
import { useAuthStore } from "./store/authStore";  // Zustand 스토어 가져오기

const App = () => {
  const [serverMessage, setServerMessage] = useState('');
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get('/test');  // 백엔드 서버 연결 테스트
        setServerMessage(response.data.message);
      } catch (error) {
        console.error('서버 연결 실패:', error.message);
        setServerMessage('서버와 연결할 수 없습니다.');
      }
    };

    fetchMessage();
    checkAuth();  // Zustand를 통해 새로고침 시 인증 상태 확인
  }, [checkAuth]);

  return (
    <Router>
      <div className="container mt-5">
        <h1 className="text-center">Our Real Trip</h1>
        {serverMessage && (
          <div
            className={`alert ${
              serverMessage.includes('실패') ? 'alert-danger' : 'alert-success'
            }`}
            role="alert">
            {serverMessage}
          </div>
        )}
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/main" />} />
          <Route path="/main" element={<Main />} />
          <Route path="/register" element={<AuthPages.Register />} />
          <Route path="/login" element={<AuthPages.Login />} />
          <Route path="/profile" element={<UserPages.Profile />} />
          <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
