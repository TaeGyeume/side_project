import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons CSS 추가
import "./styles/Login.css"; // 스타일 파일
import "bootstrap/dist/css/bootstrap.min.css";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // useNavigate 훅 초기화

  // 리디렉션 후 JWT 토큰 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      // JWT와 사용자 정보를 로컬 스토리지에 저장
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      onLogin(token); // 로그인 상태 업데이트
      alert("Facebook 로그인에 성공하셨습니다!");
      navigate("/"); // 메인 페이지로 이동
    }
  }, [onLogin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData);
      onLogin(response.data.token);
      alert("로그인에 성공하셨습니다.");
      navigate("/"); // 메인 페이지로 이동
    } catch (error) {
      console.error("Error logging in:", error.response?.data || error);
      setErrorMessage("아이디 또는 비밀번호를 다시 확인해 주세요.");
    }
  };

  const handleFacebookLogin = () => {
    // Facebook 로그인을 서버로 요청 (서버가 OAuth 흐름을 처리)
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook`;
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm p-4 text-center" style={{ maxWidth: "350px", width: "100%" }}>
        {/* Instagram 로고 */}
        <div className="mb-4">
          <img
            src="/images/instartlogo.svg"
            alt="Instagram"
            style={{ width: "175px", height: "51px" }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="전화번호, 사용자 이름 또는 이메일"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          {errorMessage && (
            <div className="alert alert-danger text-center py-2" role="alert">
              {errorMessage}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100">
            로그인
          </button>
        </form>

        <div className="text-muted my-3">또는</div>

        {/* Facebook 로그인 버튼 */}
        <button
          type="button"
          className="btn btn-outline-primary w-100 mb-3"
          onClick={handleFacebookLogin}
        >
          <i className="bi bi-facebook me-2"></i>Facebook으로 로그인
        </button>

        {/* 비밀번호 찾기 */}
        <div className="text-center">
          <a href="/forgot-password" className="text-decoration-none text-primary">
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </div>

      <div className="card shadow-sm mt-3 p-3 text-center" style={{ maxWidth: "350px", width: "100%" }}>
        <p className="mb-0">
          계정이 없으신가요?{" "}
          <a href="/register" className="text-primary text-decoration-none">
            가입하기
          </a>
        </p>
      </div>

      <div className="text-center mt-3">
        <p>앱을 다운로드하세요.</p>
        <div className="d-flex justify-content-center">
          <img src="/images/appstore.png" alt="App Store" style={{ width: "120px", marginRight: "8px" }} />
          <img src="/images/playstore.png" alt="Google Play" style={{ width: "120px" }} />
        </div>
      </div>
    </div>
  );
};

export default Login;
