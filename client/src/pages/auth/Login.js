import React, { useState } from "react";
import { authAPI } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    userid: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuthStore();

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 폼 제출 핸들러 (쿠키 기반 인증 적용)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.loginUser(formData);

      // 로그인 후 프로필 조회
      await fetchUserProfile();

      alert("로그인 성공! 메인 페이지로 이동합니다.");
      navigate("/main");
    } catch (error) {
      console.error("로그인 오류:", error);
      setError(error.response?.data?.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">로그인</h2>

          {error && <div className="alert alert-danger">{error}</div>}

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

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="/forgot-password" className="text-decoration-none">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
