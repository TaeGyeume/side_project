import {Navigate, Outlet} from 'react-router-dom';
import {useAuthStore} from '../store/authStore';
import {useEffect, useState} from 'react';

const PrivateRoute = () => {
  const {isAuthenticated, checkAuth} = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth(); // 쿠키 기반 인증 확인
      } catch (error) {
        console.error('인증 확인 실패:', error?.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuth]);

  if (loading) {
    return <div className="text-center mt-5">로딩 중...</div>; // 로딩 메시지
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
