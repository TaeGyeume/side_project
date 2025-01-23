import React, { useState, useEffect } from "react";
import { authAPI } from "../../api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState({
    userid: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    membershipLevel: "",  // 회원 등급 추가
    mileage: 0,           // 마일리지 추가 (기본값 0)
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getUserProfile();
        setUserData(response.data);
      } catch (error) {
        console.error("프로필 정보를 불러오는 데 실패했습니다.", error);
        setError("프로필 정보를 불러오는 데 실패했습니다.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // 전화번호 포맷 함수 (01012341234 -> 010-1234-1234)
  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  if (loading) return <p className="text-center">로딩 중...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">프로필 페이지</h2>
      {error && <p className="text-danger text-center">{error}</p>}
      <div className="card p-4 shadow">
        <p><strong>아이디:</strong> {userData.userid}</p>
        <p><strong>이름:</strong> {userData.username}</p>
        <p><strong>이메일:</strong> {userData.email}</p>
        <p><strong>전화번호:</strong> {formatPhoneNumber(userData.phone)}</p>
        <p><strong>주소:</strong> {userData.address || "등록된 주소가 없습니다."}</p>
        <p><strong>현재 등급:</strong> {userData.membershipLevel}</p>
        <p><strong>마일리지:</strong>(작업중)</p>

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
