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
        gender: "male",
        birthdate: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrorMessage(""); // 새로운 입력 시 에러 메시지 초기화
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (formData.password.length < 6) {
            setErrorMessage("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrorMessage("이메일 형식이 올바르지 않습니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/register`,
                formData
            );
            console.log("Register response:", response.data); // 응답 데이터 로그
            alert("회원가입 성공!");
            navigate("/login");
        } catch (error) {
            console.error("Register error:", error.response?.data); // 오류 로그
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
            {errorMessage && <p style={{ color: "red", fontWeight: "bold" }}>{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
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
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                />
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
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
