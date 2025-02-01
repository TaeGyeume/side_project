import React, {useState} from 'react';
import {authAPI} from '../../api/auth';
import {useNavigate} from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    userid: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    provider: 'local',
    membershipLevel: '길초보',
    roles: ['user']
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 입력값 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // 회원가입 폼 제출 핸들러 (httpOnly 쿠키 기반 인증 적용)
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.registerUser(formData);
      setSuccess('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">회원가입</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
            <div className="mb-3">
              <label className="form-label">아이디</label>
              <input
                type="text"
                name="userid"
                className="form-control"
                placeholder="아이디를 입력하세요"
                value={formData.userid}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">이름</label>
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="이름을 입력하세요"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">이메일</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">전화번호</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                placeholder="전화번호를 입력하세요"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">주소</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="주소를 입력하세요"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '가입 처리 중...' : '가입하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
