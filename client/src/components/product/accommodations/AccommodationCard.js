// src/components/accommodations/AccommodationCard.js
import React from 'react';
import {createSearchParams, useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import './styles/AccommodationCard.css';

// ✅ 기본 날짜 설정 함수 (오늘 + n일)
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationCard = ({
  accommodation,
  queryOptions = {},
  onAccommodationDeleted
}) => {
  const navigate = useNavigate(); // ✅ 페이지 이동을 위한 `useNavigate` 사용

  // ✅ 기본 필터값 설정 (queryOptions가 없을 경우 적용)
  const params = {
    city: queryOptions.city || '서울',
    startDate: queryOptions.startDate || getFormattedDate(1), // 내일
    endDate: queryOptions.endDate || getFormattedDate(2), // 모레
    adults: queryOptions.adults || 1,
    minPrice: queryOptions.minPrice || 0,
    maxPrice: queryOptions.maxPrice || 500000,
    category: queryOptions.category || 'all',
    sortBy: queryOptions.sortBy || 'default'
  };

  // ✅ 카드 클릭 시 상세 페이지로 이동
  const handleCardClick = () => {
    const url = `/accommodations/${accommodation._id}/detail?${createSearchParams(
      params
    )}`;
    window.open(url, '_blank');
  };

  // ✅ 수정 페이지로 이동
  const handleModifyClick = e => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    navigate(`/product/accommodations/modify/${accommodation._id}`);
  };

  // ✅ 숙소 삭제 핸들러
  const handleDeleteClick = async e => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    const confirmDelete = window.confirm(
      `"${accommodation.name}" 숙소를 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/accommodations/${accommodation._id}`);

      alert('✅ 숙소가 삭제되었습니다.');

      if (onAccommodationDeleted) {
        onAccommodationDeleted(accommodation._id); // 부모 컴포넌트에서 목록 업데이트
      } else {
        window.location.reload(); // 현재 페이지 새로고침
      }
    } catch (err) {
      console.error('❌ 숙소 삭제 오류:', err);
      alert('❌ 숙소 삭제에 실패했습니다.');
    }
  };

  // ✅ 이미지 URL 변환 로직 추가
  const SERVER_URL = 'http://localhost:5000';
  let imageUrl = accommodation.images?.[0] || '/default-image.jpg';

  // 이미지가 상대 경로(`/uploads/...`)일 경우, 서버 주소 추가
  if (imageUrl.startsWith('/uploads/')) {
    imageUrl = `${SERVER_URL}${imageUrl}`;
  }

  console.log('Accommodation Image:', imageUrl); // 디버깅용

  return (
    <div
      className="card accommodation-card mb-3"
      onClick={handleCardClick}
      style={{cursor: 'pointer'}}
    >
      <img
        src={imageUrl}
        className="card-img-top accommodation-image"
        alt={accommodation.name}
      />
      <div className="card-body">
        <h5 className="card-title">{accommodation.name}</h5>
        <p className="card-text">{accommodation.description}</p>
        <p>
          <strong>최저가:</strong> {accommodation.minPrice?.toLocaleString()}원
        </p>
      </div>
      <div className="d-flex justify-content-between px-3 pb-3">
        <button className="btn btn-warning" onClick={handleModifyClick}>
          ✏️ 수정
        </button>
        <button className="btn btn-danger" onClick={handleDeleteClick}>
          🗑️ 삭제
        </button>
      </div>
    </div>
  );
};

export default AccommodationCard;
