import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import axios from '../../api/axios';
import {SearchBar, FilterPanel, AccommodationCard} from '../../components/accommodations';

const AccommodationResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accommodations, setAccommodations] = useState([]);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '서울',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    adults: searchParams.get('adults') || 1,
    minPrice: 0,
    maxPrice: 500000,
    category: 'all',
    sortBy: 'default'
  });

  useEffect(() => {
    fetchAccommodations(filters);
  }, [filters]);

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

  const handleSearch = ({searchTerm, startDate, endDate, adults}) => {
    console.log('🔎 검색 입력값:', {searchTerm, startDate, endDate, adults});

    if (!searchTerm || typeof searchTerm !== 'string') {
      alert('유효한 검색어를 입력해주세요!');
      return;
    }

    searchTerm = searchTerm.trim() || '서울';

    setFilters(prev => {
      const newFilters = {...prev, city: searchTerm, startDate, endDate, adults};
      fetchAccommodations(newFilters);
      return newFilters;
    });

    setSearchParams({city: searchTerm, startDate, endDate, adults});
  };

  const handleFilterChange = newFilters => {
    setFilters(prev => {
      const updatedFilters = {...prev, ...newFilters};
      setSearchParams(updatedFilters);
      fetchAccommodations(updatedFilters);
      return updatedFilters;
    });
  };

  return (
    <div className="container mt-3">
      <h2>숙소 검색 결과</h2>

      {/* 검색바 */}
      <SearchBar onSearch={handleSearch} />

      <div className="row mt-3">
        {/* 필터 패널 */}
        <div className="col-md-3">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        {/* 검색 결과 */}
        <div className="col-md-9">
          {accommodations.length > 0 ? (
            accommodations.map(acc => (
              <AccommodationCard key={acc._id} accommodation={acc} />
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
