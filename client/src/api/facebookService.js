import axios from "axios";

// Facebook 로그인 요청 함수
export const facebookLogin = async (accessToken) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/facebook/login",
      { accessToken }
    );
    return response.data; // 서버로부터 받은 데이터 (JWT 토큰 등)
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};
