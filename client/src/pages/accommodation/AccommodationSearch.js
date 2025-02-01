import React from 'react';
import {useNavigate} from 'react-router-dom';
import SearchBar from '../../components/accommodations/SearchBar';

const AccommodationSearch = () => {
  const navigate = useNavigate();

  const handleSearch = ({searchTerm, startDate, endDate, adults}) => {
    console.log('🔎 검색 입력값:', {searchTerm, startDate, endDate, adults});

    if (!searchTerm || typeof searchTerm !== 'string') {
      alert('유효한 검색어를 입력해주세요!');
      return;
    }

    searchTerm = searchTerm.trim() || '서울';

    // ✅ 검색 버튼 클릭 시 검색 결과 페이지로 이동
    navigate(
      `/accommodations/results?city=${searchTerm}&startDate=${startDate}&endDate=${endDate}&adults=${adults}`
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
