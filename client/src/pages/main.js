import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {authAPI} from '../api';
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login'); // 토큰이 없으면 로그인 페이지로 이동
        return;
      }

      try {
        const response = await authAPI.getUserProfile();
        setUser(response.data); // 사용자 정보 저장
      } catch (error) {
        console.error('사용자 정보를 가져오는 데 실패했습니다.', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');

        // 401 (Unauthorized) 오류 처리
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('accessToken'); // 액세스 토큰 삭제
          navigate('/login'); // 로그인 페이지로 이동
        } else {
          setError('사용자 정보를 불러오는 데 실패했습니다.');
        }
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchUserProfile();
  }, [navigate]);

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
