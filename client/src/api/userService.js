import axiosInstance from "./axios";

// 모든 사용자 조회
export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {    
    console.error("Error fetching users:EEEEEEEEEEEEEffffssssssss", error);
    throw error;
  }
};

// 사용자 추가
export const addUser = async (username, name, email, password, phone, gender, birthdate) => {
  try {
    const response = await axiosInstance.post("/", {
      username,
      name,
      email,
      password, 
      phone,
      gender,         
      birthdate,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error.response?.data || error.message);
    throw error;
  }
};
