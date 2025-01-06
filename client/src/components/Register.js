import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",  // 기본값 설정
    birthdate: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 간단한 전화번호 형식 검증 (선택사항)
    if (name === "phone") {
      // 숫자, '-', '+' 정도만 허용하는 간단 검증 예시
      if (!/^[0-9\-\+]*$/.test(value)) {
        setErrorMessage("전화번호 형식이 올바르지 않습니다.");
        return;
      } else {
        setErrorMessage("");
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 전송 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // 제출 시 에러 메시지 초기화

    // 간단한 유효성 검사
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage("이메일 형식이 올바르지 않습니다.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    // 생년월일이 입력된 경우, 오늘 날짜보다 미래 날짜는 불가하도록 검증 (선택사항)
    if (formData.birthdate) {
      const selectedDate = new Date(formData.birthdate);
      const today = new Date();
      if (selectedDate > today) {
        setErrorMessage("미래 날짜는 생년월일로 설정할 수 없습니다.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 회원가입 요청
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        formData
      );

      console.log("Register response:", response.data);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (error) {
      console.error("Register error:", error.response?.data);

      // 서버에서 특정 message를 내려주지 않을 수도 있으므로 기본 메시지 처리
      setErrorMessage(
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>회원가입</h1>
      {errorMessage && (
        <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username (ID)"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="이름 (선택)"
          value={formData.name}
          onChange={handleChange}
          // required가 아니라면 제거 가능
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호 (6자 이상)"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="전화번호 (예: 010-1234-5678)"
          value={formData.phone}
          onChange={handleChange}
          // 전화번호를 꼭 받아야 한다면 required 유지
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="male">남성</option>
          <option value="female">여성</option>
          {/* 필요한 경우 'other' 등 옵션 추가 */}
        </select>
        <input
          type="date"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "회원가입 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
};

export default Register;
