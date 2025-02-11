// 가격, 지역, 상품명, 재고(관리자만 사용) 필터를 제공하는 공용 컴포넌트

import React from 'react';

// 지역 선택 옵션
const locationOptions = [
  '서울',
  '경기도',
  '강원도',
  '충청북도',
  '충청남도',
  '전라북도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주도'
];

const TourTicketFilter = ({
  priceRange,
  setPriceRange,
  stockRange,
  setStockRange,
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  isAdmin
}) => {
  // 가격 범위 변경 핸들러
  const handlePriceRangeChange = e => {
    const newValue = Number(e.target.value);
    setPriceRange([0, newValue]);
  };

  // 재고 범위 변경 핸들러 (관리자만 가능)
  const handleStockRangeChange = e => {
    if (!isAdmin) return;
    const newValue = Number(e.target.value);
    setStockRange([0, newValue]);
  };

  return (
    <div className="filters">
      <div>
        <label>가격 범위: 0원 - 100 만원</label>
        {priceRange[1].toLocaleString()}원
        <input
          type="range"
          min="0"
          max="1000000"
          step="500"
          value={priceRange[1]}
          onChange={handlePriceRangeChange}
          className="slider"
        />
      </div>

      {isAdmin && (
        <div>
          <label>
            재고 범위: {stockRange[0]}개 - {stockRange[1]}개
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            name="minStock"
            value={stockRange[0]}
            onChange={handleStockRangeChange}
          />
          <input
            type="range"
            min="0"
            max="1000"
            name="maxStock"
            value={stockRange[1]}
            onChange={handleStockRangeChange}
          />
        </div>
      )}

      <div>
        <label>상품명:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="상품명 검색"
        />
      </div>

      <div>
        <label>지역:</label>
        <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
          <option value="">전체</option>
          {locationOptions.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TourTicketFilter;
