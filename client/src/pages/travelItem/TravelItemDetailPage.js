import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {fetchTravelItemDetail} from '../../api/travelItem/travelItemService';
import './styles/TravelItemDetailPage.css';

const TravelItemDetailPage = () => {
  const {itemId} = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [imageError, setImageError] = useState(false); // ✅ 이미지 오류 상태 추가
  const SERVER_URL = 'http://localhost:5000';

  console.log('✅ itemId:', itemId);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await fetchTravelItemDetail(itemId);
        setItem(data);
      } catch (error) {
        console.error('❌ 상품 상세정보 불러오기 실패:', error);
      }
    };

    fetchItem();
  }, [itemId]);

  if (!item) {
    return <p className="text-center">⏳ 상품 정보를 불러오는 중...</p>;
  }

  // ✅ 기본 이미지 설정 (이미지 에러 발생 시 변경)
  let imageUrl = '/default-image.jpg';
  if (!imageError && Array.isArray(item.images) && item.images.length > 0) {
    imageUrl = item.images[0];

    if (imageUrl.startsWith('/uploads/')) {
      imageUrl = `${SERVER_URL}${imageUrl}`;
    }
  }

  return (
    <div className="container mt-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅️ 뒤로가기
      </button>

      <div className="card travel-item-detail-card">
        <img
          src={imageUrl}
          alt={item.name}
          className="travel-item-detail-image"
          onError={() => setImageError(true)} // ✅ 이미지 오류 시 상태 변경
        />
        <div className="card-body">
          <h2 className="card-title">{item.name}</h2>
          <p className="card-text">{item.description}</p>
          <p className="price-tag">💰 가격: {item.price?.toLocaleString() || '미정'}₩</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              console.log('🛒 구매 버튼 클릭, itemId:', item._id);
              if (!item._id) {
                console.error('❌ 유효하지 않은 상품 ID:', item);
                return;
              }
              navigate(`/travelItems/purchase/${item._id}`);
            }}>
            🛒 구매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TravelItemDetailPage;
