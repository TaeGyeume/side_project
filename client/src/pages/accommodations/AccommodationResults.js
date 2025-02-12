import React, {useState, useEffect, useRef, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {searchAccommodations} from '../../api/accommodation/accommodationService';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const loadingRef = useRef(false); // ✅ 중복 요청 방지

  // ✅ 필터 상태 (초기값 설정 + URL 인코딩 해결)
  const [filters, setFilters] = useState(() => ({
    city: decodeURIComponent(searchParams.get('city') || '서울'), // ✅ URL 인코딩 해제
    startDate: searchParams.get('startDate') || getFormattedDate(1),
    endDate: searchParams.get('endDate') || getFormattedDate(2),
    adults: Number(searchParams.get('adults')) || 1, // ✅ 숫자로 변환
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 500000,
    category: searchParams.get('category') || 'all',
    sortBy: searchParams.get('sortBy') || 'default'
  }));

  // ✅ 숙소 데이터 불러오기 함수
  const fetchAccommodations = useCallback(
    async (updatedFilters, newPage = 1, reset = false) => {
      if (loadingRef.current || newPage > totalPages) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        console.log('📌 검색 요청 params:', {...updatedFilters, page: newPage});
        const {accommodations: newData, totalPages: newTotalPages} =
          await searchAccommodations(updatedFilters, newPage);

        setAccommodations(prev => {
          const uniqueAccommodations = new Map();
          [...(reset ? [] : prev), ...newData].forEach(acc =>
            uniqueAccommodations.set(acc._id, acc)
          );
          return Array.from(uniqueAccommodations.values());
        });

        setTotalPages(newTotalPages);
        setPage(reset ? 1 : newPage);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [totalPages]
  );

  // ✅ 검색 실행 (SearchBar에서 호출)
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
    fetchAccommodations(newFilters, 1, true); // ✅ 검색 요청 실행 (데이터 초기화)
  };

  // ✅ 필터 변경 시 API 요청 실행
  const handleFilterChange = useCallback(
    newFilters => {
      setFilters(prev => {
        const updatedFilters = {...prev, ...newFilters};
        setSearchParams(updatedFilters);
        fetchAccommodations(updatedFilters, 1, true);
        return updatedFilters;
      });
    },
    [setSearchParams, fetchAccommodations]
  );

  // ✅ 페이지 및 필터 변경 시 숙소 데이터를 불러옴
  useEffect(() => {
    fetchAccommodations(filters, 1, true);
  }, [filters, fetchAccommodations]);

  // ✅ totalPages가 변경될 때 무한스크롤 감지를 새로 적용
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingRef.current && page < totalPages) {
          console.log('✅ 마지막 요소 감지 → 다음 페이지 불러오기!', {page, totalPages});
          fetchAccommodations(filters, page + 1); // ✅ 다음 페이지 데이터 요청
        }
      },
      {threshold: 1.0}
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect(); // ✅ 컴포넌트 언마운트 시 observer 해제
  }, [page, totalPages, filters, fetchAccommodations]); // ✅ totalPages가 변경되면 무한스크롤 다시 감지

  return (
    <div className="container mt-3">
      <h2>숙소 검색 결과</h2>

      <SearchBar onSearch={handleSearch} />

      <div className="row mt-3">
        <div className="col-md-3">
          <FilterPanel onFilterChange={handleFilterChange} />
        </div>

        <div className="col-md-9">
          {accommodations.map(acc => (
            <AccommodationCard key={acc._id} accommodation={acc} queryOptions={filters} />
          ))}
          <div ref={observerRef} style={{height: '50px', background: 'transparent'}} />
          {loading && <p className="text-center mt-2">로딩 중...</p>}
        </div>
      </div>
    </div>
  );
};

export default AccommodationResults;
