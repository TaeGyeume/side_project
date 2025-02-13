import React, {useState, useEffect} from 'react';
import {toggleFavorite} from '../../api/user/favoriteService'; // 수정된 API 사용

const FavoriteButton = ({itemId, itemType, initialFavoriteStatus}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavoriteStatus); // 초기 상태 설정

  useEffect(() => {
    setIsFavorite(initialFavoriteStatus); // 상태 초기화
  }, [initialFavoriteStatus]);

  const handleFavoriteToggle = async e => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지

    try {
      const response = await toggleFavorite(itemId, itemType);
      setIsFavorite(prev => !prev); // 상태 변경
      console.log('Favorite toggled successfully:', response);
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
