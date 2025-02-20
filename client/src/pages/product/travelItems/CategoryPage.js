import React, {useState, useEffect} from 'react';
import axios from '../../../api/axios';
import CategoryForm from '../../../components/product/travelItems/CategoryForm';
import CategoryList from '../../../components/product/travelItems/CategoryList';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]); // 전체 카테고리 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모든 카테고리 불러오기
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/travelItems/allCategories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('카테고리 불러오기 실패:', error);
      setError('카테고리를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mt-4">
      <h2>📂 카테고리 관리</h2>

      {/* 카테고리 추가 폼 */}
      <CategoryForm onCategoryCreated={fetchCategories} />

      {/* 로딩 중 표시 */}
      {loading && <p>⏳ 카테고리를 불러오는 중...</p>}

      {/* 에러 메시지 표시 */}
      {error && <p className="text-danger">{error}</p>}

      {/* 카테고리 목록 (컴포넌트 적용) */}
      {!loading && !error && (
        <>
          <h4 className="mt-4">📌 카테고리 목록</h4>
          <CategoryList
            categories={categories}
            refreshCategories={fetchCategories} // 이 부분 추가
          />
        </>
      )}
    </div>
  );
};

export default CategoryPage;
