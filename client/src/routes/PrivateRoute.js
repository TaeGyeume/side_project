import {Navigate, Outlet} from 'react-router-dom';
import {useAuthStore} from '../store/authStore';
import {useEffect, useState} from 'react';

const PrivateRoute = ({allowedRoles}) => {
  const {isAuthenticated, user, checkAuth} = useAuthStore();
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
    return <div className="text-center mt-5">로딩 중...</div>; // 로딩 중 메시지
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 역할 기반 접근 제어
  if (allowedRoles) {
    const userRoles = user?.roles;

    // 유저 역할이 배열일 경우 처리
    if (Array.isArray(userRoles)) {
      if (!userRoles.some(role => allowedRoles.includes(role))) {
        console.warn('접근 차단: 현재 유저 역할 =>', userRoles);
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // 유저 역할이 문자열일 경우 처리
      if (!allowedRoles.includes(userRoles)) {
        console.warn('접근 차단: 현재 유저 역할 =>', userRoles);
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  // 접근 허용
  return <Outlet />;
};

export default PrivateRoute;
