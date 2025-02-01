import React, {useEffect, useState} from 'react';
import api from './api/axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Route, Routes, Navigate, Link} from 'react-router-dom';
import {AuthPages, Main, UserPages} from './pages';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EditProfile from './pages/user/EditProfile';
import Header from './components/Header';
import {useAuthStore} from './store/authStore'; // Zustand 스토어
import PrivateRoute from './routes/PrivateRoute'; // 보호된 라우트 추가
import ProductPage from './pages/product/ProductPage';
import TourTicketList from './components/tourTicket/TourTicketList';
import TourTicketForm from './components/tourTicket/TourTicketForm';

const App = () => {
  const [serverMessage, setServerMessage] = useState('');
  const checkAuth = useAuthStore(state => state.checkAuth);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // 서버 메시지 및 인증 상태 확인
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await api.get('/test'); // 서버 연결 테스트
        setServerMessage(response.data.message);
      } catch (error) {
        console.error('서버 연결 실패:', error.message);
        setServerMessage('서버와 연결할 수 없습니다.');
      }
    };

    fetchMessage();
    checkAuth(); // 새로고침 시 인증 상태 확인 및 토큰 갱신
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
          {/* 비인증 사용자 접근 가능 */}
          <Route path="/" element={<Navigate to="/main" />} />
          <Route path="/main" element={<Main />} />
          <Route path="/register" element={<AuthPages.Register />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/profile" /> : <AuthPages.Login />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* 인증된 사용자만 접근 가능 */}
          <Route element={<PrivateRoute />}>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<UserPages.Profile />} />
            <Route path="/profile/update" element={<EditProfile />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/tourTicket/list" element={<TourTicketList />} />
            {/* <Route path="/product/tourTicket/list/:id" element={<TourTicketDetail />} /> */}
            <Route path="/product/tourTicket/new" element={<TourTicketForm />} />
          </Route>

          {/* 404 처리 */}
          <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
