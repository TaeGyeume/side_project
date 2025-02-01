// src/pages/accommodation/AccommodationResults.js
import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import axios from '../../api/axios';
import {SearchBar, FilterPanel, AccommodationCard} from '../../components/accommodations';

// ✅ 오늘 날짜를 YYYY-MM-DD 포맷으로 반환하는 함수
const getFormattedDate = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const AccommodationResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState([]);
  const [filters, setFilters] = useState(() => ({
    city: searchParams.get('city') || '서울',
    startDate: searchParams.get('startDate') || getFormattedDate(1),
    endDate: searchParams.get('endDate') || getFormattedDate(2),
    adults: searchParams.get('adults') || 1,
    minPrice: searchParams.get('minPrice') || 0,
    maxPrice: searchParams.get('maxPrice') || 500000,
    category: searchParams.get('category') || 'all',
    sortBy: searchParams.get('sortBy') || 'default'
  }));

  // ✅ 첫 렌더링 또는 URL 파라미터 변경 시 실행
  useEffect(() => {
    fetchAccommodations(filters);
  }, [searchParams]); // `searchParams`가 변경될 때만 실행하여 무한 루프 방지

  const fetchAccommodations = async updatedFilters => {
    try {
      console.log('📌 검색 요청 params:', updatedFilters);
      const response = await axios.get('/accommodations/search', {
        params: updatedFilters
      });
      console.log('🌍 요청된 URL:', response.config.url);
      console.log('🔍 응답 데이터:', response.data);
      setAccommodations(response.data);
    } catch (error) {
      console.error('❌ 숙소 검색 오류:', error);
    }
  };

  // ✅ 검색 실행 함수 (SearchBar에서 호출)
  const handleSearch = ({searchTerm, startDate, endDate, adults}) => {
    console.log('🔎 검색 입력값:', {searchTerm, startDate, endDate, adults});

    if (!searchTerm || typeof searchTerm !== 'string') {
      alert('유효한 검색어를 입력해주세요!');
      return;
    }

    searchTerm = searchTerm.trim() || '서울';

    const newFilters = {...filters, city: searchTerm, startDate, endDate, adults};
    setFilters(newFilters);
    setSearchParams(newFilters);
    fetchAccommodations(newFilters); // ✅ 검색 요청 실행
  };

  // ✅ 필터 변경 시 API 요청 실행
  const handleFilterChange = newFilters => {
    setFilters(prev => {
      const updatedFilters = {...prev, ...newFilters};
      setSearchParams(updatedFilters);
      fetchAccommodations(updatedFilters); // ✅ 필터 변경 시 API 요청 실행
      return updatedFilters;
    });
  };

  return (
    <div className="container mt-3">
      <h2>숙소 검색 결과</h2>

      {/* ✅ `onSearch`를 SearchBar에 전달 */}
      <SearchBar onSearch={handleSearch} />

      <div className="row mt-3">
        {/* 필터 패널 */}
        <div className="col-md-3">
          <FilterPanel onFilterChange={handleFilterChange} /> {/* ✅ 필터 변경 적용 */}
        </div>

        {/* 검색 결과 */}
        <div className="col-md-9">
          {accommodations.length > 0 ? (
            accommodations.map(acc => (
              <AccommodationCard
                key={acc._id}
                accommodation={acc}
                queryOptions={filters}
              />
            ))
          ) : (
            <p className="mt-3">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccommodationResults;
