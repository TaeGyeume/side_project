import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { resetProfileImage } from "../api/userService"; // 기본 이미지 리셋 API 함수 가져오기

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [editBio, setEditBio] = useState(false);
    const [bio, setBio] = useState("");
    const navigate = useNavigate();

    // 사용자 정보 가져오기
    const fetchUserInfo = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must log in.");
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
        } catch (err) {
            console.error("Error fetching user info:", err.message);
            setError("Failed to fetch user information.");
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
            setError("You must log in.");
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
            setError("Failed to upload profile image.");
        }
    };

    // 상태 메시지 변경 핸들러
    const handleBioUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must log in.");
            navigate("/login");
            return;
        }

        try {
            console.log("Updating bio:", bio); // bio 상태 확인
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/users/me`,
                { bio },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Server response:", response.data); // 서버 응답 확인
            setUserInfo((prev) => ({ ...prev, bio: response.data.bio })); // userInfo의 bio 업데이트
            setEditBio(false); // 편집 모드 종료
        } catch (err) {
            console.error("Error updating bio:", err.message);
            setError("Failed to update bio.");
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
            setError("Failed to reset profile image.");
        } finally {
            setLoading(false);
        }
    };

    // 초기 사용자 정보 가져오기
    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>내정보</h1>
            <p>닉네임: {userInfo?.username}</p>
            <p>이름: {userInfo?.name}</p>
            <p>이메일: {userInfo?.email}</p>
            <p>핸드폰번호: {userInfo?.phone}</p>
            <p>성별: {userInfo?.gender}</p>
            <p>생년월일: {userInfo?.birthdate}</p>
            <p>
                상태 메시지창:{" "}
                {editBio ? (
                    <>
                        <input
                            type="text"
                            value={bio} // bio 상태 기반 렌더링
                            onChange={(e) => setBio(e.target.value)} // 입력값으로 bio 상태 업데이트
                        />
                        <button onClick={handleBioUpdate}>저장</button>
                        <button onClick={() => setEditBio(false)}>취소</button>
                    </>
                ) : (
                    <>
                        {userInfo?.bio || "상태 메시지가 없습니다."} {/* userInfo에서 bio 상태를 가져오기 */}
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
                    {selectedFile ? "업로드 프로필 이미지" : "변경할 프로필 이미지"}
                </button>
            </div>
            <div>
                <button onClick={handleResetProfileImage} style={{ marginTop: "10px" }}>
                    기본이미지로 변경
                </button>
            </div>
        </div>
    );
};

export default Profile;
