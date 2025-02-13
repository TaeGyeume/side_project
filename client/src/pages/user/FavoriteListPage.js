import React, {useState, useEffect} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService'; // 즐겨찾기 목록 API 호출 함수

const FavoriteListPage = () => {
  const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  // 컴포넌트가 마운트될 때 즐겨찾기 목록 가져오기
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getUserFavorites(); // API 호출
        setFavorites(response.favorites); // 상태에 즐겨찾기 목록 저장
      } catch (error) {
        setError('즐겨찾기 목록을 가져오는 데 실패했습니다.');
        console.error(error);
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchFavorites();
  }, []); // 빈 배열로 설정하면 마운트 시에만 호출됨

  if (loading) {
    return <div>Loading...</div>; // 로딩 중에 보여줄 메시지
  }

  if (error) {
    return <div>{error}</div>; // 에러 메시지
  }

  return (
    <div className="favorite-list-container">
      <h1>My Favorite Items</h1>
      <div className="favorite-list">
        {favorites.length > 0 ? (
          favorites.map(favorite => (
            <div key={favorite._id} className="favorite-item">
              <img
                src={`http://localhost:5000${favorite.item.image}`} // 아이템 이미지
                alt={favorite.item.title}
                className="favorite-item-image"
                style={{width: '150px', height: '150px', objectFit: 'cover'}} // 이미지 스타일
              />
              <div className="favorite-item-info">
                <h3>{favorite.item.title}</h3>
                <p>{favorite.item.description}</p>
                <p>{favorite.item.price.toLocaleString()}원</p>{' '}
                {/* 가격에 천 단위 구분기호 추가 */}
              </div>
            </div>
          ))
        ) : (
          <p>즐겨찾기한 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FavoriteListPage;
