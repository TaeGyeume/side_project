// src/components/accommodations/AccommodationCard.js
import React from 'react';
import {useNavigate, createSearchParams} from 'react-router-dom';

// ✅ 기본 날짜 설정 함수 (오늘 + n일)
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationCard = ({accommodation, queryOptions = {}}) => {
  const navigate = useNavigate();

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

  const handleDetailClick = () => {
    const url = `/accommodations/${accommodation._id}/detail?${createSearchParams(
      params
    )}`;

    // ✅ 새 탭에서 상세 페이지 열기
    window.open(url, '_blank');
  };

  return (
    <div className="card mb-3">
      <img
        src={accommodation.images?.[0] || '/default-image.jpg'}
        className="card-img-top"
        alt={accommodation.name}
      />
      <div className="card-body">
        <h5 className="card-title">{accommodation.name}</h5>
        <p className="card-text">{accommodation.description}</p>
        <p>
          <strong>최저가:</strong> {accommodation.minPrice?.toLocaleString()}원
        </p>
        <button className="btn btn-primary" onClick={handleDetailClick}>
          상세 보기
        </button>
      </div>
    </div>
  );
};

export default AccommodationCard;
