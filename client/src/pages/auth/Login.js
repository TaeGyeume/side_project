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
  const navigate = useNavigate();  // 페이지 이동을 위한 네비게이트 훅

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authAPI.loginUser(formData);
      localStorage.setItem("accessToken", response.data.accessToken);  // JWT 토큰 저장

      alert("로그인 성공! 메인 페이지로 이동합니다.");  // 성공 메시지 알림
      navigate("/main");  // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
      setError(error.response?.data?.message || "로그인에 실패했습니다.");
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

            <button type="submit" className="btn btn-primary w-100">
              로그인
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
