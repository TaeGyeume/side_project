import React, {useState, useEffect} from 'react';
import {toggleFavorite} from '../../api/user/favoriteService';
import './styles/styles.css'; // 스타일 파일 불러오기

const FavoriteButton = ({itemId, itemType, initialFavoriteStatus}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavoriteStatus); // ✅ 초기값 적용
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ 서버에서 받은 초기값을 UI에 반영
    setIsFavorite(initialFavoriteStatus);
  }, [initialFavoriteStatus]);

  // 즐겨찾기 토글 처리
  const handleFavoriteToggle = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      // ✅ 낙관적 UI 업데이트 (누르면 변경되도록)
      setIsFavorite(prev => !prev);

      // 서버 요청: 즐겨찾기 토글
      const response = await toggleFavorite(itemId, itemType);
      console.log('✅ Favorite toggled:', response);

      if (!(response.status === 'success' || response.message?.includes('success'))) {
        setIsFavorite(prev => !prev); // 서버 응답 실패 시 롤백
      }
    } catch (error) {
      setIsFavorite(prev => !prev); // 에러 발생 시 롤백
      console.error('🚨 즐겨찾기 토글 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      className={`favorite-button ${isFavorite ? 'favorite' : ''}`} // ✅ UI 업데이트
      disabled={loading}>
      <i className={`fas fa-bookmark ${isFavorite ? 'favorite' : ''}`} />
    </button>
  );
};

export default FavoriteButton;
