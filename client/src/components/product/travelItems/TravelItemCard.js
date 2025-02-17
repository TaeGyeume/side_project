import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuthStore} from '../../../store/authStore';
import {deleteTravelItem} from '../../../api/travelItem/travelItemService';
import FavoriteButton from '../../user/FavoriteButton'; // ✅ 즐겨찾기 버튼 추가
import './styles/TravelItemCard.css';

const TravelItemCard = ({travelItem, onItemDeleted, isFavorite, onFavoriteToggle}) => {
  const navigate = useNavigate();
  const {user, isAuthenticated} = useAuthStore();
  const SERVER_URL = 'http://localhost:5000';
  const [imgError, setImgError] = useState(false);

  // ✅ 이미지 URL 설정
  let imageUrl = imgError ? '/default-image.jpg' : '/default-image.jpg';

  if (!imgError && Array.isArray(travelItem?.images) && travelItem.images.length > 0) {
    imageUrl = travelItem.images[0];
    if (imageUrl.startsWith('/uploads/')) {
      imageUrl = `${SERVER_URL}${imageUrl}`;
    }
  }

  // ✅ 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = () => {
    navigate(`/travelItems/${travelItem._id}`);
  };

  const handleModifyClick = e => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    navigate(`/product/travelItems/edit/${travelItem._id}`); // 수정 페이지로 이동
  };

  // ✅ 삭제 버튼 클릭 시 호출
  const handleDeleteClick = async e => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (!window.confirm(`🚨 '${travelItem.name}'을(를) 삭제하시겠습니까?`)) return;

    try {
      await deleteTravelItem(travelItem._id);
      alert('✅ 상품이 삭제되었습니다.');

      // ✅ 리스트 새로고침을 위해 콜백 실행
      if (onItemDeleted) {
        onItemDeleted(travelItem._id); // 삭제된 항목의 ID 전달
      } else {
        window.location.reload(); // ✅ 콜백이 없으면 강제 새로고침
      }
    } catch (error) {
      console.error('❌ 상품 삭제 중 오류 발생:', error);
      alert('❌ 상품 삭제 실패');
    }
  };

  return (
    <div
      className="card travel-item-card mb-3"
      onClick={handleCardClick}
      style={{cursor: 'pointer'}}>
      {/* 🔹 이미지 컨테이너 */}
      <div className="image-container">
        <img
          src={imageUrl}
          className="card-img-top travel-item-image"
          alt={travelItem?.name || '상품 이미지'}
          onError={() => setImgError(true)} // ✅ 한 번만 실행되도록 상태 업데이트
        />

        {/* ✅ 즐겨찾기 버튼 (이미지 내부 오른쪽 상단) */}
        <div className="favorite-icon-container">
          <FavoriteButton
            itemId={travelItem._id}
            itemType="TravelItem"
            initialFavoriteStatus={isFavorite}
            onFavoriteToggle={onFavoriteToggle}
            className="favorite-icon"
          />
        </div>
      </div>

      {/* 🔹 상품 정보 */}
      <div className="card-body">
        <h5 className="card-title">{travelItem?.name || '상품명 없음'}</h5>
        <p className="card-text">{travelItem?.description || '설명 없음'}</p>
        <p>
          <strong>💰 {travelItem?.price?.toLocaleString() || '가격 미정'}₩</strong>
        </p>
        <p
          className={`card-text ${travelItem?.stock > 0 ? 'text-success' : 'text-danger'}`}>
          {travelItem?.stock > 0 ? '✅ 재고 있음' : '❌ 품절'}
        </p>
      </div>

      {/* 🔹 관리자 전용 버튼 */}
      {isAuthenticated && user?.roles.includes('admin') && (
        <div className="card-footer d-flex justify-content-between">
          <button className="btn btn-warning" onClick={handleModifyClick}>
            ✏️ 수정
          </button>
          <button className="btn btn-danger" onClick={handleDeleteClick}>
            ❌ 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelItemCard;
