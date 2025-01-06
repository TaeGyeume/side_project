import React, { useState } from "react";
import axios from "axios";

const ProfileImageUpload = ({ currentImage, onImageUpload }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false); // 수정 모드 상태

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 파일 크기 제한 (5MB 예시)
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB.");
            return;
        }

        setSelectedFile(file);
        setError(null); // 에러 초기화
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file!");
            return;
        }

        const formData = new FormData();
        formData.append("profileImage", selectedFile);

        setLoading(true); // 업로드 시작 시 로딩 상태로 변경
        try {
            const token = localStorage.getItem("token"); // JWT 가져오기
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/users/me/profile-image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // JWT 추가
                    },
                }
            );

            alert("Image uploaded successfully!");
            onImageUpload(response.data.profileImage); // 부모 컴포넌트에 새로운 이미지 알림
            setSelectedFile(null); // 선택된 파일 초기화
            setEditMode(false); // 수정 모드 비활성화
        } catch (error) {
            console.error("Error uploading image:", error);
            setError("Failed to upload image.");
        } finally {
            setLoading(false); // 로딩 상태 해제
        }
    };

    return (
        <div>
            <h2>Update Profile Image</h2>
            {currentImage && (
                <img
                    src={`${process.env.REACT_APP_API_URL}${currentImage}`} // 서버 URL 포함
                    alt="Profile"
                    style={{ width: 100, height: 100, borderRadius: "50%" }}
                />
            )}

            {!editMode ? (
                <button onClick={() => setEditMode(true)}>Edit</button> // 수정 모드 활성화 버튼
            ) : (
                <div>
                    <input type="file" onChange={handleFileChange} />
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <button onClick={handleUpload} disabled={loading}>
                        {loading ? "Uploading..." : "Upload"}
                    </button>
                    <button onClick={() => setEditMode(false)}>Cancel</button> {/* 수정 모드 취소 버튼 */}
                </div>
            )}
        </div>
    );
};

export default ProfileImageUpload;
