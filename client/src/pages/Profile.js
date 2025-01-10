import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { resetProfileImage } from "../api/userService"; // 기본 이미지 리셋 API 함수 가져오기z

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
    const [phone, setPhone] = useState(""); // 전화번호 상태
    const [gender, setGender] = useState(""); // 성별 수정 상태
    const [username, setUsername] = useState(""); // 사용자 이름 수정 상태
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
            // 디버깅 로그 추가
            console.log("Fetched user info:", response.data); // 서버 응답 확인
            console.log("Setting email state:", response.data.email);
            // 상태 업데이트
            setUserInfo(response.data);
            setBio(response.data.bio || "");
            setName(response.data.name || "");
            setEmail(response.data.email || ""); // email 상태 초기화
            setPhone(response.data.phone || "");
            setGender(response.data.gender || "");
            setUsername(response.data.username || "");
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

    // 사용자 정보 수정
    const handleUserInfoUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrorMessage("You must log in.");
            navigate("/login");
            return;
        }

        try {
            // 요청에서 이메일 제외
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/users/me`,
                { username, name, gender }, // email 제거
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // 이메일 제외하고 상태 업데이트
            setUserInfo((prev) => ({
                ...prev,
                username: response.data.username,
                name: response.data.name,
                gender: response.data.gender,
            }));

            setEditUserInfo(false); // 수정 모드 종료
        } catch (err) {
            console.error("Error updating user info:", err.message);
            setErrorMessage("이미사용중인 사용자 이름입니다");
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
            <p>
                사용자 이름:{" "}
                {editUserInfo ? (
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // 사용자 이름 수정
                    />
                ) : (
                    userInfo?.username
                )}
            </p>
            <p>
                핸드폰번호:{" "}
                <input
                    type="text"
                    value={phone}
                    disabled // 수정 불가
                />
            </p>
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
                이메일: {userInfo?.email}
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
                    이미지 삭제
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
