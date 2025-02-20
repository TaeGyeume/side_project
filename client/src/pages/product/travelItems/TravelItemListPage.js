import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import CategorySelector from '../../../components/product/travelItems/CategorySelector';
import TravelItemCard from '../../../components/product/travelItems/TravelItemCard';

const TravelItemListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedTopCategory, setSelectedTopCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [items, setItems] = useState([]);

  // 모든 카테고리 및 전체 상품 불러오기 (최초 실행)
  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const categoryResponse = await axios.get('/travelItems/allCategories');
        const allCategories = categoryResponse.data.categories || [];

        setCategories(allCategories);
        setTopCategories(allCategories.filter(cat => !cat.parentCategory));

        // 처음에는 모든 상품을 불러옴
        fetchItemsByCategory('all'); // 모든 상품 조회
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    fetchCategoriesAndItems();
  }, []);

  // 특정 카테고리에 속한 상품 불러오기
  const fetchItemsByCategory = async (categoryId = 'all') => {
    try {
      // categoryId가 'all'이면 모든 상품 조회 API 호출
      const endpoint =
        categoryId === 'all'
          ? '/travelItems/allItems'
          : `/travelItems/byCategory/${categoryId}`;
      const response = await axios.get(endpoint);
      const allItems = response.data.items || [];

      console.log('불러온 상품 목록:', allItems);
      setItems(allItems);
    } catch (error) {
      console.error('상품 불러오기 실패:', error);
    }
  };

  // 최상위 카테고리 선택 시, 해당 카테고리와 모든 하위 카테고리 상품 표시
  const handleTopCategoryChange = topCategoryId => {
    setSelectedTopCategory(topCategoryId);
    setSelectedSubCategory('');
    setItems([]);

    if (!topCategoryId) {
      setSubCategories([]);
      fetchItemsByCategory('all'); // 최상위 선택 해제 시 모든 상품 표시
      return;
    }

    // 하위 카테고리 필터링 (상품 제외)
    const filteredSubCategories = categories.filter(
      cat => cat.parentCategory?._id === topCategoryId
    );
    setSubCategories(filteredSubCategories);

    // 최상위 카테고리 및 해당 하위 카테고리에 속한 모든 상품 불러오기
    fetchItemsByCategory(topCategoryId);
  };

  // 하위 카테고리 선택 시, 해당 하위 카테고리에 속한 상품들만 가져오기
  const handleSubCategoryChange = async subCategoryId => {
    setSelectedSubCategory(subCategoryId);
    setItems([]);

    if (!subCategoryId) {
      fetchItemsByCategory(selectedTopCategory); // 하위 카테고리 선택 해제 시 상위 카테고리 상품 다시 표시
      return;
    }

    fetchItemsByCategory(subCategoryId);
  };

  return (
    <div className="container mt-4">
      <h2>🛍️ 여행용품 조회</h2>

      {/* 추가된 버튼 (상품 및 카테고리 등록 페이지 이동) */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate('/product/travelItems/new')}>
          ➕ 상품 등록
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/product/travelItems/newCategory')}>
          📂 카테고리 관리
        </button>
      </div>

      {/* 카테고리 선택 */}
      <CategorySelector
        topCategories={topCategories}
        subCategories={subCategories}
        selectedTopCategory={selectedTopCategory}
        selectedSubCategory={selectedSubCategory}
        onTopCategoryChange={handleTopCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
      />

      {/* 선택한 카테고리의 상품 리스트 */}
      <div className="row">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item._id} className="col-md-4 mb-4">
              <TravelItemCard travelItem={item} />
            </div>
          ))
        ) : (
          <p>등록된 상품이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default TravelItemListPage;
