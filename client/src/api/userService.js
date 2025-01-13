import axiosInstance from "./axios";
import axios from "axios"; // axios 패키지 가져오기

// 모든 사용자 조회
export const fetchUsers = async () => {
  try {
     // 인증 없이 요청하려면 axiosInstance가 아닌 기본 axios로 호출
     const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
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

// 사용자 정보 업데이트
export const updateUserInfo = async (updatedData) => {
  try {
    const token = localStorage.getItem("token"); // 인증 토큰 가져오기
    if (!token) throw new Error("You must log in.");

    const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/me`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`, // 인증 헤더 추가
      },
    });
    return response.data; // 업데이트된 사용자 정보 반환
  } catch (error) {
    console.error("Error updating user info:", error.message);
    throw error; // 에러 다시 던지기
  }
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

