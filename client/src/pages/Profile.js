import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { resetProfileImage } from "../api/userService"; // 기본 이미지 리셋 API 함수 가져오기

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [editBio, setEditBio] = useState(false);
    const [editUserInfo, setEditUserInfo] = useState(false); // 사용자 정보 수정 모드
    const [bio, setBio] = useState("");
    const [name, setName] = useState(""); // 이름 수정 상태
    const [email, setEmail] = useState(""); // 이메일 수정 상태
    const [phone, setPhone] = useState(""); // 전화번호 수정 상태
    const [gender, setGender] = useState(""); // 성별 수정 상태
    const navigate = useNavigate();

    // 사용자 정보 가져오기
    const fetchUserInfo = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("You must log in.");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Fetched user info:", response.data); // 서버 응답 확인
            setUserInfo(response.data); // userInfo 상태 업데이트
            setBio(response.data.bio || ""); // bio 상태 초기화
            setName(response.data.name); // 이름 초기화
            setEmail(response.data.email); // 이메일 초기화
            setPhone(response.data.phone); // 전화번호 초기화
            setGender(response.data.gender); // 성별 초기화
        } catch (err) {
            console.error("Error fetching user info:", err.message);
            setErrorMessage("Failed to fetch user information.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // 프로필 이미지 업로드
    const handleUpload = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("You must log in.");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/me/profile-image`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setUserInfo((prev) => ({ ...prev, profileImage: response.data.profileImage }));
            setSelectedFile(null);
        } catch (err) {
            console.error("Error uploading profile image:", err.message);
            setErrorMessage("Failed to upload profile image.");
        }
    };

    // 상태 메시지 변경 핸들러
    const handleBioUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("You must log in.");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/users/me`,
                { bio },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUserInfo((prev) => ({ ...prev, bio: response.data.bio }));
            setEditBio(false);
        } catch (err) {
            console.error("Error updating bio:", err.message);
            setErrorMessage("Failed to update bio.");
        }
    };

    // 이메일 형식 검증 함수
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 전화번호 형식 검증 함수
    const isValidPhone = (phone) => {
        const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/; // 010-1234-1234 형식
        return phoneRegex.test(phone);
    };

    // 사용자 정보 수정
    const handleUserInfoUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("You must log in.");
            navigate("/login");
            return;
        }

        if (!isValidEmail(email)) {
            setErrorMessage("이메일 형식이 올바르지 않습니다.");
            return;
        }

        if (!isValidPhone(phone)) {
            setErrorMessage("전화번호 형식이 올바르지 않습니다.");
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/users/me`,
                { name, email, phone, gender },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUserInfo((prev) => ({
                ...prev,
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                gender: response.data.gender,
            }));

            setEditUserInfo(false); // 수정 모드 종료
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setErrorMessage("Email, phone number, or username already exists. Please enter a different value.");
            } else {
                console.error("Error updating user info:", err.message);
                setErrorMessage("Failed to update user information.");
            }
        }
    };

    // 기본 프로필 이미지로 변경
    const handleResetProfileImage = async () => {
        setLoading(true);
        try {
            const response = await resetProfileImage();
            setUserInfo((prev) => ({
                ...prev,
                profileImage: response.profileImage, // 기본 이미지로 업데이트
            }));
        } catch (err) {
            console.error("Error resetting profile image:", err.message);
            setErrorMessage("Failed to reset profile image.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>내정보</h1>
            {errorMessage && <p style={{ color: "red", fontSize: "12px", fontWeight: "bold" }}>{errorMessage}</p>}
            <p>닉네임: {userInfo?.username}</p>
            <p>
                이름:{" "}
                {editUserInfo ? (
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)} // 이름 수정
                    />
                ) : (
                    userInfo?.name
                )}
            </p>
            <p>
                이메일:{" "}
                {editUserInfo ? (
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // 이메일 수정
                    />
                ) : (
                    userInfo?.email
                )}
            </p>
            <p>
                핸드폰번호:{" "}
                {editUserInfo ? (
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)} // 전화번호 수정
                        placeholder="010-1234-1234 형식으로 입력하세요"
                    />
                ) : (
                    userInfo?.phone
                )}
            </p>
            <p>
                성별:{" "}
                {editUserInfo ? (
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">선택</option>
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                    </select>
                ) : (
                    userInfo?.gender
                )}
            </p>

            <p>
                소개:{" "}
                {editBio ? (
                    <>
                        <input
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)} // bio 상태 업데이트
                        />
                        <button onClick={handleBioUpdate}>저장</button>
                        <button onClick={() => setEditBio(false)}>취소</button>
                    </>
                ) : (
                    <>
                        {userInfo?.bio || "상태 메시지가 없습니다."}
                        <button onClick={() => setEditBio(true)}>수정</button>
                    </>
                )}
            </p>

            {userInfo?.profileImage && (
                <img
                    src={`http://localhost:5000${userInfo.profileImage}`}
                    alt="Profile"
                    style={{ width: "150px", height: "150px" }}
                />
            )}

            <div>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: selectedFile ? "block" : "none" }}
                />
                {selectedFile && <p>선택된 파일: {selectedFile.name}</p>}
                <button onClick={selectedFile ? handleUpload : () => document.querySelector('input[type="file"]').click()}>
                    프로필 이미지 변경
                </button>

                <button onClick={handleResetProfileImage} style={{ marginTop: "10px" }}>
                    기본이미지로 변경
                </button>
            </div>

            {editUserInfo ? (
                <button onClick={handleUserInfoUpdate}>저장</button>
            ) : (
                <button onClick={() => setEditUserInfo(true)}>수정</button>
            )}
        </div>
    );
};

export default Profile;
