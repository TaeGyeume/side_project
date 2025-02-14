import React, {useState, useEffect} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await getUserFavorites();
        setFavorites(response.favorites);
      } catch (error) {
        // console.error('❌ Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []); // 🚀 빈 배열([]) → 페이지 진입 시 한 번 실행

  return (
    <div>
      <h1>즐겨찾기 목록</h1>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <ul>
          {favorites.map(fav => (
            <li key={fav._id}>
              <img src={fav.images[0]} alt={fav.title} width="100" />
              <p>
                {fav.title} ({fav.location})
              </p>
              <p>{fav.price}원</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FavoritesPage;
