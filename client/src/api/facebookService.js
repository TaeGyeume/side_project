// client/src/facebookService.js

import axios from 'axios';


// 페북로그인
export const facebookLogin = async (accessToken) => {
  try {
    const response = await axios.post('http://localhost:5000/auth/facebook/login', { accessToken });
    return response.data; // JWT 토큰 등 서버에서 반환한 데이터
  } catch (error) {
    console.error('Facebook login error:', error);
    throw error;
  }
};
