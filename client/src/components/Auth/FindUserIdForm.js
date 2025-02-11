import React, {useState} from 'react';
import {authAPI} from '../../api/auth/auth'; // 수정된 경로

const FindUserIdForm = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증 코드 입력
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  // 이메일 제출 핸들러
  const handleSubmitEmail = async e => {
    e.preventDefault();
    setError('');
    console.log('📩 이메일 제출:', email); // 요청 데이터 확인
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    try {
      console.log('🚀 서버로 아이디 찾기 요청 중...');
      const response = await authAPI.findUserId(email);

      console.log('✅ 서버 응답:', response); // 서버 응답 확인

      alert('인증 코드가 이메일로 전송되었습니다.');
      setStep(2); // 이메일 제출 후 인증 코드 입력 단계로 변경
    } catch (error) {
      console.error('❌ 인증 코드 발송 실패:', error.response?.data || error);
      setError('해당 이메일로 가입된 계정이 없습니다.');
    }
  };

  // 인증 코드 제출 핸들러
  const handleSubmitCode = async e => {
    e.preventDefault();
    setError('');
    console.log('🔍 [클라이언트] 인증 코드 검증 요청:', email, verificationCode);

    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      // 서버로 인증 코드 검증 요청
      const response = await authAPI.verifyCode({
        email,
        code: verificationCode
      });

      console.log('✅ [클라이언트] 인증 코드 검증 응답:', response); // 서버 응답 확인

      if (response && response.userId) {
        setUserId(response.userId);
        setStep(3); // 아이디 찾기 성공 페이지로 이동
      } else {
        setError('잘못된 인증 코드입니다.');
      }
    } catch (error) {
      console.error('❌ [클라이언트] 인증 코드 확인 실패:', error);
      setError(error.response?.data?.message || '인증 코드 확인 실패');
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      {step === 1 && (
        <form onSubmit={handleSubmitEmail}>
          <div className="mb-3">
            <label className="form-label">가입된 이메일 주소</label>
            <input
              type="email"
              className="form-control"
              placeholder="이메일 입력"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">
            인증 코드 받기
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitCode}>
          <div className="mb-3">
            <label className="form-label">인증 코드 입력</label>
            <input
              type="text"
              className="form-control"
              placeholder="인증 코드 입력"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-success w-100">
            확인
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center">
          <h4>
            찾은 아이디: <strong>{userId}</strong>
          </h4>
          <a href="/login" className="btn btn-primary mt-3">
            로그인하기
          </a>
        </div>
      )}
    </div>
  );
};

export default FindUserIdForm;
