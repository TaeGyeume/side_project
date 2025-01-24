import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // Zustand 상태 사용
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, fetchUserProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        await fetchUserProfile(); // Zustand 스토어에서 사용자 정보 불러오기
      } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다.', error);

        // 401 (Unauthorized) 처리: 로그인 페이지로 리디렉션
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError('사용자 정보를 불러오는 데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [fetchUserProfile, navigate]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">메인 페이지</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : user ? (
        <div className="text-center">
          <h4>환영합니다, {user.username}님!</h4>
        </div>
      ) : (
        <p className="text-center text-danger">사용자 정보를 불러올 수 없습니다.</p>
      )}
    </div>
  );
};

export default Main;
