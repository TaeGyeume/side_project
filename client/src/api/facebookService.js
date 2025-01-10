import axiosInstance from './axios';

// 페이스북 로그인
export const facebookLogin = async (accessToken) => {
  try {
    const response = await axiosInstance.post(
      '/auth/facebook',
      { accessToken }
    );
    return response.data;
  } catch (error) {
    console.error('Error during Facebook login:', error);
    throw error;
  }
};
