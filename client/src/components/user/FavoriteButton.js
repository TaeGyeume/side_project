import React, {useState, useEffect, useCallback} from 'react';
import {toggleFavorite, getUserFavorites} from '../../api/user/favoriteService';
import './styles/styles.css'; // 스타일 파일 불러오기

const FavoriteButton = ({itemId, itemType}) => {
  const [isFavorite, setIsFavorite] = useState(false); // 즐겨찾기 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가

  // ⭐ 로그인 여부 체크 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('accessToken'); // JWT 토큰 확인
    return !!token; // 토큰이 있으면 true, 없으면 false 반환
  };

  // 즐겨찾기 상태 조회 함수 - useCallback으로 메모이제이션
  const checkFavoriteStatus = useCallback(async () => {
    if (!checkLoginStatus()) {
      // console.log('🚫 User is not logged in, skipping favorite fetch.');
      return;
    }
    try {
      const response = await getUserFavorites();
      console.log('📥 Fetched favorites:', response.favorites);

      // 아이템 비교: _id로만 비교
      const normalizedItemId = itemId.toString().trim();
      const isItemFavorite = response.favorites.some(
        fav => fav._id.toString().trim() === normalizedItemId
      );

      setIsFavorite(isItemFavorite);
      return isItemFavorite; // 상태 반환
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('인증 토큰이 만료되었습니다.');
        // 여기서 리프레시 토큰 로직 처리 가능
      }
      // console.error('즐겨찾기 상태 조회 실패:', error);
      return false;
    }
  }, [itemId]);

  // 초기 로딩
  useEffect(() => {
    const initializeFavorite = async () => {
      setLoading(true);
      await checkFavoriteStatus(); // 서버에서 즐겨찾기 상태 조회
      setLoading(false);
    };

    initializeFavorite();
  }, [checkFavoriteStatus, itemId]);

  // 즐겨찾기 토글 처리
  const handleFavoriteToggle = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      setLoading(true);

      // 낙관적 UI 업데이트
      setIsFavorite(prev => !prev);

      // 서버 요청: 즐겨찾기 토글
      const response = await toggleFavorite(itemId, itemType);
      console.log('✅ Favorite toggled:', response);

      // 서버 응답 확인
      if (response.status === 'success' || response.message?.includes('success')) {
        // 토글 성공 - 상태는 이미 업데이트됨
        console.log('즐겨찾기 상태가 성공적으로 변경되었습니다.');
      } else {
        // 서버 응답이 실패인 경우 상태 롤백
        setIsFavorite(prev => !prev);
        console.error('서버 응답 실패:', response);
      }
    } catch (error) {
      // 에러 발생 시 상태 롤백
      setIsFavorite(prev => !prev);

      if (error.response?.status === 401) {
        console.error('인증이 필요합니다. 다시 로그인해주세요.');
        // 여기서 로그인 페이지로 리다이렉트 또는 리프레시 토큰 갱신 로직 추가
      } else {
        console.error('즐겨찾기 토글 실패:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 버튼 비활성화 상태 계산
  const isDisabled = loading;

  return (
    <button
      onClick={handleFavoriteToggle}
      className={`favorite-button ${loading ? 'loading' : ''}`}
      disabled={isDisabled}>
      <i
        className={`fas fa-bookmark ${isFavorite ? 'favorite' : ''}`}
        style={{opacity: loading ? 0.5 : 1}}
      />
    </button>
  );
};

export default FavoriteButton;
