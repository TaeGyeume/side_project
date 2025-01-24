import React, { useState, useEffect } from "react";
import { authAPI } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    userid: "",
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  // 사용자 프로필 불러오기 (쿠키 인증 기반)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await checkAuth();  // 쿠키 인증 상태 확인
        const response = await authAPI.getUserProfile();
        setFormData(response);
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

  // 입력 값 변경 핸들러
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 폼 제출 핸들러 (프로필 업데이트)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await authAPI.updateProfile(formData);
      setSuccess("프로필이 성공적으로 업데이트되었습니다.");
      setTimeout(() => navigate("/profile"), 2000);  
    } catch (error) {
      setError(error.response?.data?.message || "프로필 업데이트에 실패했습니다.");
    }
  };

  if (loading) return <p className="text-center">프로필 정보를 불러오는 중...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">프로필 수정</h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {success && <div className="alert alert-success text-center">{success}</div>}

      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            type="text"
            name="userid"
            className="form-control"
            value={formData.userid}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">이메일</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">전화번호</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">주소</label>
          <input
            type="text"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          수정하기
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
