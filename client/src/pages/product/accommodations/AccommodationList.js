import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from '../../../api/axios';
import AccommodationCard from '../../../components/product/accommodations/AccommodationCard';
import SearchBar from '../../../components/product/accommodations/SearchBar';

const AccommodationList = ({limit = 6}) => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const observerInstance = useRef(null);

  // ✅ 데이터 가져오기 함수
  const fetchAccommodations = useCallback(
    async (pageNumber = 1, isNewSearch = false, searchValue = searchTerm) => {
      if (loadingRef.current || (pageNumber > totalPages && !isNewSearch)) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        console.log('✅ 백엔드 요청 보냄... 페이지:', pageNumber, '검색어:', searchValue);

        const endpoint = searchValue
          ? '/accommodations/searchByName'
          : '/accommodations/list';
        const params = searchValue
          ? {page: pageNumber, limit, name: searchValue}
          : {page: pageNumber, limit};

        const response = await axios.get(endpoint, {params});

        console.log('✅ 응답 데이터:', response.data);

        const result = response.data.accommodations || response.data;

        if (!Array.isArray(result)) {
          throw new Error('❌ accommodations 배열이 없음!');
        }

        // ✅ 중복 제거 로직 적용
        setAccommodations(prev => {
          const uniqueAccommodations = new Map();
          [...prev, ...result].forEach(acc => uniqueAccommodations.set(acc._id, acc));
          return Array.from(uniqueAccommodations.values());
        });

        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error('❌ 숙소 데이터를 불러오는 중 오류:', err);
        setError('숙소 정보를 불러오는 중 오류 발생');
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [totalPages, limit, searchTerm]
  );

  // ✅ 검색어가 변경될 때 새로운 검색 수행
  useEffect(() => {
    console.log('✅ 검색어 변경됨. 새로운 검색 실행!', searchTerm);
    setAccommodations([]);
    setPage(1);
    fetchAccommodations(1, true, searchTerm);
  }, [searchTerm, fetchAccommodations]);

  // ✅ 초기 데이터 로드
  useEffect(() => {
    console.log('✅ 초기 데이터 로드');
    fetchAccommodations(1, true);
  }, [fetchAccommodations]);

  // ✅ 페이지 변경 시 데이터 불러오기 (즉시 실행)
  useEffect(() => {
    if (page > 1 && !loadingRef.current) {
      console.log('📌 페이지 변경됨, 데이터 불러오기', page);
      fetchAccommodations(page);
    }
  }, [page, fetchAccommodations]);

  // ✅ 무한 스크롤 (Intersection Observer 사용)
  useEffect(() => {
    if (!observerRef.current) {
      console.log('❌ observerRef.current가 설정되지 않음');
      return;
    }

    if (observerInstance.current) {
      observerInstance.current.disconnect(); // 기존 observer 해제
    }

    observerInstance.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingRef.current && page < totalPages) {
          console.log('✅ 마지막 요소 감지 → 다음 페이지 불러오기!', {page, totalPages});
          setPage(prev => {
            const newPage = prev + 1;
            fetchAccommodations(newPage);
            return newPage;
          });
        }
      },
      {threshold: 1.0}
    );

    observerInstance.current.observe(observerRef.current);

    return () => {
      if (observerInstance.current) observerInstance.current.disconnect();
    };
  }, [totalPages, fetchAccommodations, page]);

  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-3">
      <h2>숙소 목록</h2>

      {location.pathname !== '/product' && (
        <>
          <SearchBar onSearch={setSearchTerm} />
          <button
            className="btn btn-success"
            onClick={() => navigate('/product/accommodations/new')}
          >
            + 숙소 등록
          </button>
          <button
            type="button"
            className="btn btn-primary ml-2"
            onClick={() => navigate('/product/locations/list')}
          >
            📍 위치 리스트
          </button>
        </>
      )}

      <div className="row">
        {accommodations.length > 0 ? (
          accommodations.map(acc => (
            <div key={acc._id} className="col-md-4">
              <AccommodationCard accommodation={acc} />
            </div>
          ))
        ) : (
          <p>숙소가 없습니다.</p>
        )}
      </div>

      {/* ✅ 무한 스크롤을 위한 감지 요소 (높이 조정) */}
      <div ref={observerRef} style={{height: '80px', background: 'transparent'}} />

      {/* ✅ 로딩 상태 표시 */}
      {loading && <div style={{textAlign: 'center', marginTop: '10px'}}>로딩 중...</div>}
    </div>
  );
};

export default AccommodationList;
