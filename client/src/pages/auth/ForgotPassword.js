import React, { useState } from "react";
import { authAPI } from "../../api/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setMessage("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
    } catch (error) {
      setError(error.response?.data?.message || "비밀번호 찾기 요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">비밀번호 찾기</h2>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
            <div className="mb-3">
              <label className="form-label">이메일 주소</label>
              <input
                type="email"
                className="form-control"
                placeholder="가입한 이메일을 입력하세요"
                value={email}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "전송 중..." : "비밀번호 재설정 링크 보내기"}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="/login" className="text-decoration-none">로그인 페이지로 돌아가기</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
