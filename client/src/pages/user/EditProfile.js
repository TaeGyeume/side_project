import React, {useState, useEffect} from 'react';
import {authAPI} from '../../api/auth';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '../../store/authStore';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    userid: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkMessage, setCheckMessage] = useState({
    userid: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();
  const {checkAuth} = useAuthStore();

  // 사용자 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await checkAuth();
        const response = await authAPI.getUserProfile();
        setFormData(response);
      } catch (error) {
        console.error('프로필 정보를 불러오는 데 실패했습니다.', error);
        setError('프로필 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, checkAuth]);

  // 입력 값 변경 핸들러
  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setCheckMessage({...checkMessage, [e.target.name]: ''});
  };

  // 중복 확인 API 호출
  const handleCheckDuplicate = async field => {
    console.log(`중복 확인 요청: ${field} =`, formData[field]); // 클릭 시 확인 로그

    try {
      const response = await authAPI.checkDuplicate({[field]: formData[field]});
      console.log('서버 응답:', response.data);
      setCheckMessage({...checkMessage, [field]: response.data.message});
    } catch (error) {
      console.error('중복 확인 실패:', error.response?.data || error.message);
      setCheckMessage({
        ...checkMessage,
        [field]: error.response?.data?.message || '중복 확인에 실패했습니다.'
      });
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await authAPI.updateProfile(formData);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setError(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  if (loading) return <p className="text-center">프로필 정보를 불러오는 중...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">프로필 수정</h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {success && <div className="alert alert-success text-center">{success}</div>}

      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <div className="d-flex">
            <input
              type="text"
              name="userid"
              className="form-control me-2"
              value={formData.userid}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleCheckDuplicate('userid')}>
              중복 확인
            </button>
          </div>
          {checkMessage.userid && (
            <small className="text-danger">{checkMessage.userid}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">이메일</label>
          <div className="d-flex">
            <input
              type="email"
              name="email"
              className="form-control me-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleCheckDuplicate('email')}>
              중복 확인
            </button>
          </div>
          {checkMessage.email && (
            <small className="text-danger">{checkMessage.email}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">전화번호</label>
          <div className="d-flex">
            <input
              type="text"
              name="phone"
              className="form-control me-2"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handleCheckDuplicate('phone')}>
              중복 확인
            </button>
          </div>
          {checkMessage.phone && (
            <small className="text-danger">{checkMessage.phone}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">주소</label>
          <input
            type="text"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          수정하기
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
