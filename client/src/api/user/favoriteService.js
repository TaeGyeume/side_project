import axios from 'axios';

// Axios 전역 설정: 쿠키 포함
axios.defaults.withCredentials = true;

// 즐겨찾기 추가/삭제 (토글)
export const toggleFavorite = async (itemId, itemType) => {
  try {
    console.log(`Toggling favorite for item: ${itemId}, Type: ${itemType}`);

    const response = await axios.post(
      'http://localhost:5000/api/favorites/toggle',
      {itemId, itemType},
      {withCredentials: true} // 쿠키 포함 설정
    );

    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to toggle favorite');
  }
};

// 사용자 즐겨찾기 목록 조회
export const getUserFavorites = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/favorites', {
      withCredentials: true // 쿠키 포함 설정
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error('Failed to fetch user favorites');
  }
};
