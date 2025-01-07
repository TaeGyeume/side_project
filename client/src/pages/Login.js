import React, { useState } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css"; // Bootstrap Icons CSS 추가
import "./styles/Login.css"; // 기존 스타일 파일

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData);
            alert("로그인이 성공되셨습니다");
            onLogin(response.data.token);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Error logging in:", error.response?.data || error);
            alert("아이디 또는 비밀번호를 다시 확인해 주세요");
        }
    };

    if (isLoggedIn) {
        return <h2>로그인 성공!</h2>;
    }

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Instagram 아이콘 추가 */}
                <h1 className="instagram-logo">
                    <i className="bi bi-instagram"></i> Instagram
                </h1>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="전화번호, 사용자 이름 또는 이메일"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="login-input"
                    />
                    <button type="submit" className="login-button">
                        로그인
                    </button>
                </form>
                <div className="separator">또는</div>
                <button className="facebook-login">
                    <i className="bi bi-facebook"></i> Facebook으로 로그인
                </button>
                <a href="/forgot-password" className="forgot-password">
                    비밀번호를 잊으셨나요?
                </a>
            </div>
            <div className="signup-container">
                계정이 없으신가요? <a href="/signup">가입하기</a>
            </div>
        </div>
    );
};

export default Login;
