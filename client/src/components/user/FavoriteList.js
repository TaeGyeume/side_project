import React, {useState, useEffect} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService'; // 즐겨찾기 데이터 요청
import './styles/FavoriteList.css';

const FavoriteList = () => {
  const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 즐겨찾기 목록을 가져오는 함수
  const fetchFavorites = async () => {
    try {
      const response = await getUserFavorites(); // 서버에서 즐겨찾기 목록 가져오기
      setFavorites(response.favorites); // 가져온 데이터를 상태에 저장
    } catch (error) {
      console.error('즐겨찾기 목록 가져오기 오류:', error);
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  // 페이지 로드 시 즐겨찾기 목록을 가져옴
  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="favorite-list-container">
      <h1>즐겨찾기 목록</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="favorite-list">
          {favorites.length > 0 ? (
            favorites.map(item => (
              <div key={item._id} className="favorite-item">
                <img
                  src={`http://localhost:5000${item.images[0]}`}
                  alt={item.title}
                  className="favorite-item-image"
                />
                <div className="favorite-item-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>{item.price}원</p>
                </div>
              </div>
            ))
          ) : (
            <p>즐겨찾기한 항목이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteList;
