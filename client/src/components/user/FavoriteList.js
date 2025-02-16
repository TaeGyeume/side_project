import React, {useState, useEffect} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService';
import {useNavigate} from 'react-router-dom';
import FavoriteButton from '../../components/user/FavoriteButton';
import './styles/FavoriteList.css';

const FavoriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ `useNavigate()` 올바르게 가져오기

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await getUserFavorites();
        setFavorites(response.favorites);
      } catch (error) {
        console.error('즐겨찾기 목록 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

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
              <div
                key={item._id}
                className="favorite-item"
                onClick={() => {
                  if (item._id) {
                    navigate(`/tourTicket/list/${item._id}`); // ✅ ID가 있을 때만 이동
                  } else {
                    console.error('❌ Error: item._id is undefined');
                  }
                }}
                style={{cursor: 'pointer'}}>
                <img
                  src={`http://localhost:5000${item.images[0]}`}
                  alt={item.title}
                  className="favorite-item-image"
                />
                <div className="favorite-item-info">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <p>{item.price.toLocaleString()}원</p>
                  {/* ✅ 즐겨찾기 버튼 추가 */}
                  <FavoriteButton
                    itemId={item._id}
                    itemType="TourTicket"
                    initialFavoriteStatus={item.isFavorite}
                    onClick={e => e.stopPropagation()} // ✅ 이벤트 전파 방지
                  />
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
