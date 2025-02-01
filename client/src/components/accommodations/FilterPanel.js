import React, {useState} from 'react';
import Slider from 'react-slider';
import './styles/FilterPanel.css';

const FilterPanel = ({onFilterChange}) => {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const handleFilterChange = () => {
    onFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category,
      sortBy
    });
  };

  return (
    <div className="card p-3">
      <h5>필터</h5>
      <div className="mb-3">
        <label>가격 (1박 기준 요금)</label>
        <p className="price-range">
          <span className="price-text">{priceRange[0].toLocaleString()}원</span> -{' '}
          <span className="price-text">
            {priceRange[1].toLocaleString()}
            {priceRange[1] === 500000 ? '+' : ''}원
          </span>
        </p>

        <Slider
          className="price-slider"
          min={0}
          max={500000}
          step={10000} // 가격 조정 단위
          value={priceRange}
          onChange={setPriceRange}
        />

        <div className="d-flex justify-content-between">
          <span className="text-muted">0원</span>
          <span className="text-muted">500,000원+</span>
        </div>
      </div>

      <div className="mb-2">
        <label>숙소 유형</label>
        <select
          className="form-select"
          value={category}
          onChange={e => setCategory(e.target.value)}>
          <option value="all">전체</option>
          <option value="Hotel">호텔</option>
          <option value="Pension">펜션</option>
          <option value="Resort">리조트</option>
          <option value="Motel">모텔</option>
        </select>
      </div>

      <div className="mb-2">
        <label>정렬 기준</label>
        <select
          className="form-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}>
          <option value="default">기본순</option>
          <option value="priceLow">가격 낮은 순</option>
          <option value="priceHigh">가격 높은 순</option>
        </select>
      </div>

      <button className="btn btn-primary mt-2" onClick={handleFilterChange}>
        필터 적용
      </button>
    </div>
  );
};

export default FilterPanel;
