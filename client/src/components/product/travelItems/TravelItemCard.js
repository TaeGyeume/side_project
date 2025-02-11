import React from 'react';
import {useNavigate} from 'react-router-dom';
import './styles/TravelItemCard.css';
import axios from 'axios';

const TravelItemCard = ({travelItem, onItemDeleted}) => {
  const navigate = useNavigate();
  const SERVER_URL = 'http://localhost:5000';

  // ✅ travelItem이 정상적으로 전달되는지 확인 (디버깅)
  console.log('🔍 TravelItemCard - travelItem:', travelItem);
  console.log('🔍 travelItem.images:', travelItem?.images);

  // ✅ 기본 이미지 설정
  let imageUrl = '/default-image.jpg';

  if (Array.isArray(travelItem?.images) && travelItem.images.length > 0) {
    imageUrl = travelItem.images[0];
  }

  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${SERVER_URL}${imageUrl}`;
  }

  console.log('✅ 최종 TravelItem Image URL:', imageUrl); // 디버깅용

  // ✅ 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = () => {
    navigate(`/product/travelItems/${travelItem._id}/detail`);
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
      await axios.delete(`${SERVER_URL}/api/travelItems/${travelItem._id}`); // ✅ 서버 URL 포함
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
      <img
        src={imageUrl}
        className="card-img-top travel-item-image"
        alt={travelItem?.name || '상품 이미지'}
        onError={e => {
          e.target.src = '/default-image.jpg';
        }} // 이미지 로딩 실패 시 기본 이미지로 변경
        style={{objectFit: 'cover', height: '200px'}}
      />
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
      <div className="card-footer d-flex justify-content-between">
        <button className="btn btn-warning" onClick={handleModifyClick}>
          ✏️ 수정
        </button>
        <button className="btn btn-danger" onClick={handleDeleteClick}>
          ❌ 삭제
        </button>
      </div>
    </div>
  );
};

export default TravelItemCard;
