import axiosInstance from "./axios";
import axios from "axios"; // axios 패키지 가져오기

// 모든 사용자 조회
export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {    
    console.error("Error fetching users:", error);
    throw error;
  }
};

// 사용자 추가
export const addUser = async (formData) => {
  console.log("Sending formData to server:", formData); // 디버깅
  const response = await axios.post(`${process.env.REACT_APP_API_URL}/users`, formData);
  return response.data;
};

// 프로필 이미지를 기본 이미지로 리셋
export const resetProfileImage = async () => {
  try {
    const token = localStorage.getItem("token"); // 인증 토큰 가져오기
    if (!token) throw new Error("You must log in.");

    const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/me/profile/reset`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // 서버에서 반환된 데이터 반환
  } catch (error) {
    console.error("Error resetting profile image:", error);
    throw error; // 에러 다시 던지기
  }
};

