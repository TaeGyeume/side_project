import React, { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Profile = () => {
  const [userData, setUserData] = useState({
    userid: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    membershipLevel: "",
    mileage: 0, 
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await checkAuth();  // 쿠키 기반 인증 상태 확인
        const response = await authAPI.getUserProfile();
        setUserData(response);
      } catch (error) {
        console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
        setError("프로필 정보를 불러오는 데 실패했습니다. 다시 로그인해주세요.");
        setTimeout(() => navigate("/login"), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, checkAuth]);

  // 전화번호 포맷 함수 (01012341234 -> 010-1234-1234)
  const formatPhoneNumber = (phone) => {
    return phone ? phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3") : "번호 없음";
  };

  if (loading) return <p className="text-center">프로필 불러오는 중...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">프로필 페이지</h2>
      {error && <p className="text-danger text-center">{error}</p>}

      <div className="card p-4 shadow">
        <p><strong>아이디:</strong> {userData.userid || "N/A"}</p>
        <p><strong>이름:</strong> {userData.username || "N/A"}</p>
        <p><strong>이메일:</strong> {userData.email || "N/A"}</p>
        <p><strong>전화번호:</strong> {formatPhoneNumber(userData.phone)}</p>
        <p><strong>주소:</strong> {userData.address || "등록된 주소가 없습니다."}</p>
        <p><strong>현재 등급:</strong> {userData.membershipLevel || "등급 없음"}</p>
        <p><strong>마일리지:</strong> {userData.mileage} 점</p>

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-secondary" disabled>
            쿠폰함 (작업중)
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/edit-profile")}>
            프로필 수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
