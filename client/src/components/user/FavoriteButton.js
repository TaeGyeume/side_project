import React, {useState, useEffect} from 'react';
import {toggleFavorite} from '../../api/user/favoriteService'; // 즐겨찾기 추가/삭제 API 호출 함수

const FavoriteButton = ({itemId, itemType, initialFavoriteStatus}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavoriteStatus); // 초기 상태 받아오기

  useEffect(() => {
    setIsFavorite(initialFavoriteStatus); // 초기 상태 설정
  }, [initialFavoriteStatus]);

  const handleFavoriteToggle = async e => {
    e.stopPropagation(); // 클릭 이벤트가 상위 요소로 전파되지 않도록 방지

    try {
      console.log('Toggling favorite for item:', itemId, itemType); // 디버깅: 요청 데이터 확인
      const response = await toggleFavorite(itemId, itemType);
      console.log('Response from toggleFavorite:', response); // 디버깅: 응답 확인

      if (response.message === 'Favorite added successfully') {
        setIsFavorite(true); // 즐겨찾기 추가
      } else if (response.message === 'Favorite removed successfully') {
        setIsFavorite(false); // 즐겨찾기 제거
      }
    } catch (error) {
      console.error('Error toggling favorite:', error); // 디버깅: 오류 확인
    }
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      className={`favorite-button ${isFavorite ? 'favorite' : ''}`}>
      <i className={`fas fa-bookmark ${isFavorite ? 'favorite' : ''}`}></i>
    </button>
  );
};

export default FavoriteButton;
