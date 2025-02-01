import React, {useState} from 'react';
import {authAPI} from '../../api/auth';
import {useNavigate, useSearchParams} from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // URL에서 토큰 추출

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 입력 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword
      });
      setMessage('비밀번호가 성공적으로 재설정되었습니다.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setError(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">비밀번호 재설정</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
            <div className="mb-3">
              <label className="form-label">새 비밀번호</label>
              <input
                type="password"
                name="newPassword"
                className="form-control"
                placeholder="새 비밀번호를 입력하세요"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '처리 중...' : '비밀번호 변경'}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="/login" className="text-decoration-none">
              로그인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
