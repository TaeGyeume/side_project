import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    birthdate: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 전송 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    // 간단한 유효성 검사
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // 서버와 통신하여 응답 받기
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        formData
      );
  
      // 응답 데이터를 사용하여 처리
      console.log("Register response:", response);  // 응답 확인용
      if (response.status === 201) {
        // alert 대신 navigate만 사용
        navigate("/login"); // 성공적으로 회원가입 후 로그인 페이지로 이동
      }
    } catch (error) {
      console.error("Register error:", error.response?.data);
      // 오류가 발생하면 에러 메시지 표시
      setErrorMessage(
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm p-4 text-center" style={{ maxWidth: "350px", width: "100%" }}>
        {/* Instagram 로고 이미지 */}
        <div className="mb-4">
          <img
            src="/images/instartlogo.svg"
            alt="Instagram"
            style={{ width: "175px", height: "51px" }}
          />
        </div>

        <p className="text-muted">친구들의 사진과 동영상을 보려면 가입하세요.</p>

        <button className="btn btn-primary w-100 mb-3">Facebook으로 로그인</button>

        <div className="text-muted my-2">또는</div>

        {errorMessage && (
          <div className="alert alert-danger text-center py-2" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              name="email"
              placeholder="휴대폰 번호 또는 이메일 주소"
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
          <div className="mb-3">
            <input
              type="text"
              name="name"
              placeholder="성명"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="username"
              placeholder="사용자 이름"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="phone"
              placeholder="전화번호 (예: 010-1234-5678)"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
          <div className="mb-3">
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <p className="text-muted" style={{ fontSize: "0.8rem" }}>
            저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.{" "}
            <button className="btn btn-link text-primary p-0" type="button" style={{ fontSize: "0.8rem" }}>
              더 알아보기
            </button>
          </p>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-100">
            {isSubmitting ? "가입 중..." : "가입"}
          </button>
        </form>
      </div>

      <div className="card shadow-sm mt-3 p-3 text-center" style={{ maxWidth: "350px", width: "100%" }}>
        <p className="mb-0">
          계정이 있으신가요?{" "}
          <a href="/login" className="text-primary">
            로그인
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

export default Register;
