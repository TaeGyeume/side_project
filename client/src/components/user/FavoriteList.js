import React, {useState, useEffect} from 'react';
import {getUserFavorites} from '../../api/user/favoriteService';
import {useNavigate} from 'react-router-dom';
import FavoriteButton from '../../components/user/FavoriteButton';
import './styles/FavoriteList.css';

const FavoriteList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //  즐겨찾기 목록 불러오기
  const fetchFavorites = async () => {
    try {
      const response = await getUserFavorites();
      // console.log(' 즐겨찾기 목록 데이터:', response.favorites);
      setFavorites(response.favorites.map(fav => ({...fav, isFavorite: true})));
    } catch (error) {
      // console.error(' 즐겨찾기 목록 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  //  즐겨찾기 상태를 즉시 UI에 반영하는 함수
  const updateFavoriteStatus = (itemId, newStatus) => {
    // console.log(` 업데이트된 즐겨찾기 상태 (${itemId}):`, newStatus);

    setFavorites(prevFavorites =>
      prevFavorites.map(item =>
        item.itemId === itemId ? {...item, isFavorite: newStatus} : item
      )
    );

    //  즐겨찾기 해제 시 리스트에서 삭제 (선택 사항)
    if (!newStatus) {
      setFavorites(prevFavorites => prevFavorites.filter(item => item.itemId !== itemId));
    }
  };

  //  아이템 클릭 시 적절한 URL로 이동
  const handleItemClick = item => {
    let url = '/';

    //  itemType에 따라 이동할 경로 설정
    switch (item.itemType) {
      case 'TourTicket':
        url = `/tourTicket/list/${item.itemId}`;
        break;
      case 'TravelItem':
        url = `/travelItems/${item.itemId}`;
        break;
      case 'Accommodation':
        url = `/accommodations/${item.itemId}/detail`;
        break;
      default:
        console.warn(' 알 수 없는 itemType:', item.itemType);
        return;
    }

    navigate(url);
  };

  return (
    <div className="favorite-list-container">
      <h1>즐겨찾기 목록</h1>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div className="favorite-list">
          {favorites.length > 0 ? (
            favorites.map(item => {
              // console.log('🛠 즐겨찾기 아이템:', item);

              return (
                <div
                  key={item.itemId}
                  className="favorite-item"
                  onClick={() => handleItemClick(item)} //  동적 URL 이동
                  style={{cursor: 'pointer'}}>
                  {/*  이미지 컨테이너 내부에 즐겨찾기 아이콘 배치 */}
                  <div className="favorite-item-image-container">
                    <img
                      src={`http://localhost:5000${item.images?.[0]}`}
                      alt={item.title}
                      className="favorite-item-image"
                    />

                    {/*  아이콘이 이미지 안에 배치되도록 수정 */}
                    <div className="favorite-list-icon">
                      <FavoriteButton
                        itemId={item.itemId}
                        itemType={item.itemType || 'TourTicket'}
                        initialFavoriteStatus={item.isFavorite}
                        onFavoriteToggle={updateFavoriteStatus}
                      />
                    </div>
                  </div>

                  <div className="favorite-item-info">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <p>{item.price?.toLocaleString()}원</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>즐겨찾기한 항목이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FavoriteList;
