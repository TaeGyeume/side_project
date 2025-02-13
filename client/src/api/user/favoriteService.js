import axios from 'axios';
import Cookies from 'js-cookie';

// 즐겨찾기 토글 (추가/삭제)
export const toggleFavorite = async (itemId, itemType) => {
  try {
    const token = Cookies.get('accessToken'); // 쿠키에서 토큰 가져오기

    if (!token) {
      throw new Error('No token found in cookies');
    }

    const response = await axios.post(
      'http://localhost:5000/api/favorites/toggle', // 서버의 즐겨찾기 토글 API
      {itemId, itemType},
      {
        headers: {Authorization: `Bearer ${token}`} // 쿠키에서 가져온 토큰을 헤더에 추가
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to toggle favorite');
  }
};

// 사용자 즐겨찾기 목록 조회
export const getUserFavorites = async () => {
  try {
    const token = Cookies.get('accessToken'); // 쿠키에서 accessToken 가져오기

    if (!token) {
      throw new Error('No token found in cookies');
    }

    const response = await axios.get('http://localhost:5000/api/favorites', {
      headers: {Authorization: `Bearer ${token}`} // 쿠키에서 가져온 토큰을 헤더에 추가
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user favorites:', error);
    throw error;
  }
};
