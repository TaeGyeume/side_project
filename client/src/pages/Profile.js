import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [editBio, setEditBio] = useState(false);
    const [bio, setBio] = useState("");
    const navigate = useNavigate();

    const fetchUserInfo = async () => {
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
            setUserInfo(response.data);
            setBio(response.data.bio); // 상태 메시지 초기화
        } catch (err) {
            console.error("Error fetching user info:", err.message);
            setError("Failed to fetch user information.");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

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

    const handleBioChange = (e) => {
        setBio(e.target.value);
    };

    const handleBioUpdate = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You must log in.");
            navigate("/login");
            return;
        }

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/me`, { bio }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserInfo(response.data);
            setEditBio(false);
        } catch (err) {
            console.error("Error updating bio:", err.message);
            setError("Failed to update bio.");
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [navigate]);

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
                상태 메시지창: 
                {editBio ? (
                    <>
                        <input type="text" value={bio} onChange={handleBioChange} />
                        <button onClick={handleBioUpdate}>저장</button>
                        <button onClick={() => setEditBio(false)}>취소</button>
                    </>
                ) : (
                    <>
                        {userInfo?.bio}
                        <button onClick={() => setEditBio(true)}>수정</button>
                    </>
                )}
            </p>
            {userInfo?.profileImage && (
                <img src={`http://localhost:5000${userInfo.profileImage}`} alt="Profile" style={{ width: "150px", height: "150px" }} />
            )}
            <div>
                <input type="file" onChange={handleFileChange} style={{ display: selectedFile ? "block" : "none" }} />
                {selectedFile && <p>Selected file: {selectedFile.name}</p>}
                <button onClick={selectedFile ? handleUpload : () => document.querySelector('input[type="file"]').click()}>
                    {selectedFile ? "Upload Profile Image" : "Change Profile Image"}
                </button>
            </div>
        </div>
    );
};

export default Profile;
