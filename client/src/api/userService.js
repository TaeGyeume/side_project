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
// export const addUser = async (username, name, email, password, phone, gender, birthdate) => {
//   try {
//     const response = await axiosInstance.post("/", {
//       username,
//       name,
//       email,
//       password, 
//       phone,
//       gender,         
//       birthdate,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error adding user:", error.response?.data || error.message);
//     throw error;
//   }
// };

