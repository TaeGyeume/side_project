import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../../api/axios';
import CategorySelector from '../../../components/product/travelItems/CategorySelector';
import TravelItemList from '../../../components/product/travelItems/TravelItemList';

const TravelItemListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedTopCategory, setSelectedTopCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [items, setItems] = useState([]);

  // ✅ 모든 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/travelItems/allCategories');
        const allCategories = response.data.categories || [];

        setCategories(allCategories);
        setTopCategories(allCategories.filter(cat => !cat.parentCategory)); // 최상위 카테고리 필터링
      } catch (error) {
        console.error('❌ 카테고리 불러오기 실패:', error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 최상위 카테고리 선택 시, 하위 카테고리 필터링 (상품은 제외)
  const handleTopCategoryChange = topCategoryId => {
    setSelectedTopCategory(topCategoryId);
    setSelectedSubCategory('');
    setItems([]); // 초기화

    if (!topCategoryId) {
      setSubCategories([]); // ✅ 최상위 카테고리가 선택되지 않았을 경우 초기화
      return;
    }

    // ✅ 하위 카테고리만 필터링 (상품 제외)
    const filteredSubCategories = categories.filter(
      cat => cat.parentCategory?._id === topCategoryId //&& cat.subCategories !== undefined
    );

    console.log('✅ 필터링된 하위 카테고리:', filteredSubCategories);
    setSubCategories(filteredSubCategories);

    // ✅ 최상위 카테고리 내 상품 가져오기 (필요 없다면 제거 가능)
    if (topCategoryId && topCategoryId !== '') {
      fetchItemsByCategory(topCategoryId);
    }
  };

  // ✅ 하위 카테고리 선택 시, 해당 하위 카테고리에 속한 상품들만 가져오기
  const handleSubCategoryChange = async subCategoryId => {
    setSelectedSubCategory(subCategoryId);
    setItems([]); // 초기화

    if (!subCategoryId || subCategoryId === '') {
      return; // ✅ 올바른 값이 아닐 경우 API 요청 방지
    }

    fetchItemsByCategory(subCategoryId);
  };

  // ✅ 특정 카테고리에 속한 상품 불러오기 (상품만 가져오기)
  const fetchItemsByCategory = async categoryId => {
    try {
      const response = await axios.get(`/travelItems/byCategory/${categoryId}`);
      const allItems = response.data.items || [];

      // ✅ "상품"만 필터링 (하위 카테고리는 제외)
      const filteredItems = allItems.filter(
        item => !item.subCategories || item.subCategories.length === 0
      );

      console.log('✅ 불러온 상품 목록:', filteredItems);
      setItems(filteredItems);
    } catch (error) {
      console.error('❌ 상품 불러오기 실패:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>🛍️ 여행용품 조회</h2>

      {/* ✅ 추가된 버튼 (상품 및 카테고리 등록 페이지 이동) */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate('/product/travelItems/new')}>
          ➕ 상품 등록
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/product/travelItems/newCategory')}>
          📂 카테고리 등록
        </button>
      </div>

      {/* ✅ 카테고리 선택 */}
      <CategorySelector
        topCategories={topCategories}
        subCategories={subCategories}
        selectedTopCategory={selectedTopCategory}
        selectedSubCategory={selectedSubCategory}
        onTopCategoryChange={handleTopCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
      />

      {/* ✅ 선택한 카테고리의 상품 리스트 */}
      <TravelItemList items={items} />
    </div>
  );
};

export default TravelItemListPage;
