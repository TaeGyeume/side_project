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
    membershipLevel: "",
    roles: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkMessage, setCheckMessage] = useState({
    userid: "",
    email: "",
    phone: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState("");

  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  // ✅ 사용자 프로필 불러오기 (필요한 데이터만 추출)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await checkAuth();
        const response = await authAPI.getUserProfile();
        
        // 필요한 데이터만 저장
        const filteredData = {
          userid: response.userid,
          username: response.username,
          email: response.email,
          phone: response.phone,
          address: response.address,
          membershipLevel: response.membershipLevel,
          roles: response.roles,
        };

        setFormData(filteredData);
        setOriginalData(filteredData);
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

  // ✅ 입력 값 변경 감지
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setCheckMessage({ ...checkMessage, [e.target.name]: "" });
  };

  // ✅ 중복 확인 API 호출
  const handleCheckDuplicate = async (field) => {
    if (!["userid", "email", "phone"].includes(field)) return;

    if (formData[field] === originalData[field]) {
      setCheckMessage({ ...checkMessage, [field]: "현재 값과 동일합니다." });
      return;
    }

    try {
      const response = await authAPI.checkDuplicate({ [field]: formData[field] });
      setCheckMessage({ ...checkMessage, [field]: response.message });
    } catch (error) {
      setCheckMessage({
        ...checkMessage,
        [field]: error.response?.data?.message || "중복 확인에 실패했습니다.",
      });
    }
  };

  // ✅ 변경된 값만 서버로 전송
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const updatedData = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalData[key]) {
        updatedData[key] = formData[key];
      }
    });

    if (Object.keys(updatedData).length === 0) {
      setError("변경된 내용이 없습니다.");
      return;
    }

    for (const field of ["userid", "email", "phone"]) {
      if (updatedData[field]) {
        try {
          const response = await authAPI.checkDuplicate({ [field]: updatedData[field] });
          if (response.message !== "사용 가능한 정보입니다.") {
            setError(`${field}이(가) 중복되었습니다.`);
            return;
          }
        } catch (error) {
          setError(error.response?.data?.message || `${field} 중복 확인 중 오류 발생`);
          return;
        }
      }
    }

    try {
      await authAPI.updateProfile(updatedData);
      setSuccess("프로필이 성공적으로 업데이트되었습니다.");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error) {
      setError(error.response?.data?.message || "프로필 업데이트에 실패했습니다.");
    }
    setShowModal(false);
  };

  // ✅ 모달 열기
  const openModal = (field) => {
    setEditingField(field);
    setShowModal(true);
  };

  if (loading) return <p className="text-center">프로필 정보를 불러오는 중...</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">프로필 수정</h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {success && <div className="alert alert-success text-center">{success}</div>}

      <div className="p-4 border rounded shadow">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} className="mb-3 d-flex justify-content-between">
            <p>
              <strong>{key.toUpperCase()}:</strong> {value}
            </p>
            <button className="btn btn-outline-primary btn-sm" onClick={() => openModal(key)}>
              수정
            </button>
          </div>
        ))}
      </div>

      {/* ✅ 모달 창 */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingField.toUpperCase()} 수정</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name={editingField}
                  className="form-control"
                  value={formData[editingField]}
                  onChange={handleChange}
                />
                {["userid", "email", "phone"].includes(editingField) && (
                  <button className="btn btn-outline-secondary mt-2" onClick={() => handleCheckDuplicate(editingField)}>
                    중복 확인
                  </button>
                )}
                {checkMessage[editingField] && (
                  <small className="text-danger d-block mt-1">{checkMessage[editingField]}</small>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  닫기
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
