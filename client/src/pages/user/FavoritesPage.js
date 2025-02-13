import React, {useEffect, useState} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService'; // 즐겨찾기 목록을 가져오는 서비스 함수
import {useNavigate} from 'react-router-dom';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getUserFavorites();
        setFavorites(response.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, []);

  const handleItemClick = itemId => {
    navigate(`/item/${itemId}`); // 해당 아이템의 상세 페이지로 이동
  };

  return (
    <div>
      <h1>즐겨찾기 목록</h1>
      <div>
        {favorites.length > 0 ? (
          favorites.map(favorite => (
            <div key={favorite._id} onClick={() => handleItemClick(favorite.item._id)}>
              <h3>{favorite.item.title}</h3>
              <p>{favorite.item.description}</p>
              <img
                src={`http://localhost:5000${favorite.item.images[0]}`}
                alt={favorite.item.title}
              />
            </div>
          ))
        ) : (
          <p>즐겨찾기 목록이 비어 있습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
