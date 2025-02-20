// src/pages/accommodation/AccommodationSearch.js
import React from 'react';
import {useNavigate} from 'react-router-dom';
import SearchBar from '../../components/accommodations/SearchBar';

// 오늘 날짜를 YYYY-MM-DD 포맷으로 반환하는 함수
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationSearch = () => {
  const navigate = useNavigate();

  const handleSearch = ({searchTerm, startDate, endDate, adults}) => {
    console.log('🔎 검색 입력값:', {searchTerm, startDate, endDate, adults});

    if (!searchTerm || typeof searchTerm !== 'string') {
      alert('유효한 검색어를 입력해주세요!');
      return;
    }

    searchTerm = searchTerm.trim() || '서울';

    // 기본 필터값 설정
    const defaultFilters = {
      startDate: startDate || getFormattedDate(1), // 내일 날짜
      endDate: endDate || getFormattedDate(2), // 모레 날짜
      minPrice: 0,
      maxPrice: 500000,
      category: 'all',
      sortBy: 'default'
    };

    // 검색 버튼 클릭 시 기본 필터값 포함하여 검색 결과 페이지로 이동
    navigate(
      `/accommodations/results?city=${searchTerm}&startDate=${defaultFilters.startDate}&endDate=${defaultFilters.endDate}` +
        `&adults=${adults}&minPrice=${defaultFilters.minPrice}&maxPrice=${defaultFilters.maxPrice}` +
        `&category=${defaultFilters.category}&sortBy=${defaultFilters.sortBy}`
    );
  };

  return (
    <div className="container mt-3">
      <h2>숙소 검색</h2>
      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

export default AccommodationSearch;
