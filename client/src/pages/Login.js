import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData);
            alert("로그인이 성공되셧습니다");
            onLogin(response.data.token); // 로그인 성공 시 토큰 저장
            setIsLoggedIn(true); // 로그인 상태 변경
            console.log("Received token:", response.data.token);
            localStorage.getItem("token");
        } catch (error) {
            console.error("Error logging in:", error.response?.data || error);
            alert("아이디 또는 비밀번호를 다시확인해 주세요");
        }
    };

    if (isLoggedIn) {
        return <h2>로그인 성공!!!!!</h2>; // 로그인 성공 시 메시지 표시
    }

    return (
        <div>
            <h1>로그인 페이지!</h1>
            <form onSubmit={handleSubmit}>
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
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
