import React, {useState, useEffect} from 'react';
import {toggleFavorite, getUserFavorites} from '../../api/user/favoriteService'; // API 호출 함수
import './styles/styles.css'; // CSS 불러오기

const FavoriteButton = ({itemId, itemType}) => {
  const [isFavorite, setIsFavorite] = useState(false); // 기본값을 false로 설정
  const [loading, setLoading] = useState(true); // 로딩 상태

  // ⭐ 서버에서 사용자 즐겨찾기 목록 조회 & 초기값 설정
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getUserFavorites(); // 서버에서 즐겨찾기 목록 가져오기
        const favoriteItems = response.favorites.map(fav => fav.item); // 사용자의 즐겨찾기된 아이템 목록
        setIsFavorite(favoriteItems.includes(itemId)); // 현재 아이템이 즐겨찾기에 포함되어 있으면 true
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [itemId]); // itemId가 변경될 때마다 실행

  // ⭐ 즐겨찾기 버튼 클릭 이벤트
  const handleFavoriteToggle = async e => {
    e.stopPropagation(); // 이벤트 전파 방지

    try {
      const response = await toggleFavorite(itemId, itemType);

      if (response.message === 'Favorite added successfully') {
        setIsFavorite(true);
      } else if (response.message === 'Favorite removed successfully') {
        setIsFavorite(false);
      }

      console.log('Favorite toggled successfully:', response);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // 로딩 중이면 버튼 비활성화
  if (loading)
    return (
      <button className="favorite-button" disabled>
        ...
      </button>
    );

  return (
    <button onClick={handleFavoriteToggle} className="favorite-button">
      <i className={`fas fa-bookmark ${isFavorite ? 'favorite' : ''}`}></i>
    </button>
  );
};

export default FavoriteButton;
