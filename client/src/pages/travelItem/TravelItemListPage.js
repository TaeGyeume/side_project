import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../api/axios';
import TravelItemCard from '../../components/product/travelItems/TravelItemCard';

const TravelItemListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // 모든 카테고리 저장
  const [topCategories, setTopCategories] = useState([]); // 최상위 카테고리
  const [subCategories, setSubCategories] = useState([]); // 하위 카테고리
  const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리
  const [items, setItems] = useState([]); // 선택된 카테고리의 상품들

  // ✅ 모든 카테고리 및 전체 상품 불러오기 (최초 실행)
  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const categoryResponse = await axios.get('/travelItems/allCategories');
        const allCategories = categoryResponse.data.categories || [];

        setCategories(allCategories);
        setTopCategories(allCategories.filter(cat => !cat.parentCategory));

        // ✅ 처음에는 모든 상품을 불러옴
        fetchItemsByCategory(null);
      } catch (error) {
        console.error('❌ 카테고리 불러오기 실패:', error);
      }
    };

    fetchCategoriesAndItems();
  }, []);

  // ✅ 특정 카테고리에 속한 상품 불러오기
  const fetchItemsByCategory = async (categoryId = null) => {
    try {
      // ✅ categoryId가 `null`이면 모든 상품 조회 API 호출
      const endpoint = categoryId
        ? `/travelItems/byCategory/${categoryId}`
        : '/travelItems/allItems';

      const response = await axios.get(endpoint);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('❌ 상품 불러오기 실패:', error);
    }
  };

  // ✅ 최상위 카테고리 선택 시, 해당 카테고리와 모든 하위 카테고리 상품 표시
  const handleCategoryClick = categoryId => {
    setSelectedCategory(categoryId);

    // ✅ 하위 카테고리 필터링 (빈 서브카테고리 제거)
    const filteredSubCategories = categories.filter(
      cat => cat.parentCategory?._id === categoryId && cat.subCategories.length > 0
    );

    setSubCategories(filteredSubCategories);

    fetchItemsByCategory(categoryId);
  };

  return (
    <div className="container mt-4">
      <h2>🛍️ 여행용품 조회</h2>

      {/* ✅ 카테고리 버튼 */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {topCategories.map(category => (
          <button
            key={category._id}
            className={`btn ${selectedCategory === category._id ? 'btn-dark' : 'btn-light'}`}
            onClick={() => handleCategoryClick(category._id)}>
            {category.name}
          </button>
        ))}
      </div>

      {/* ✅ 서브카테고리 버튼 (서브카테고리가 있는 경우만 렌더링) */}
      {subCategories.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {subCategories.map(subCategory => (
            <button
              key={subCategory._id}
              className={`btn ${selectedCategory === subCategory._id ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleCategoryClick(subCategory._id)}>
              {subCategory.name}
            </button>
          ))}
        </div>
      )}

      {/* ✅ 선택한 카테고리의 상품 리스트 */}
      <div className="row">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item._id} className="col-md-4 mb-4">
              <TravelItemCard travelItem={item} />
            </div>
          ))
        ) : (
          <p>카테고리를 선택해주세요.</p>
        )}
      </div>
    </div>
  );
};

export default TravelItemListPage;
