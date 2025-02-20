import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from '../../api/axios';
import TravelItemCard from '../../components/product/travelItems/TravelItemCard';
import {getUserFavorites} from '../../api/user/favoriteService';

const TravelItemListPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]); // 모든 카테고리 저장
  const [topCategories, setTopCategories] = useState([]); // 최상위 카테고리
  const [subCategories, setSubCategories] = useState([]); // 하위 카테고리
  const [selectedCategory, setSelectedCategory] = useState(null); // 선택된 카테고리
  const [items, setItems] = useState([]); // 선택된 카테고리의 상품들
  const [favorites, setFavorites] = useState([]); // 즐겨찾기 목록 추가

  // 모든 카테고리 및 전체 상품 불러오기 (최초 실행)
  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const categoryResponse = await axios.get('/travelItems/allCategories');
        const allCategories = categoryResponse.data.categories || [];

        setCategories(allCategories);
        setTopCategories(allCategories.filter(cat => !cat.parentCategory));

        // 처음에는 모든 상품을 불러옴
        fetchItemsByCategory(null);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    };

    // 사용자 즐겨찾기 목록 불러오기
    const fetchFavorites = async () => {
      try {
        const response = await getUserFavorites();
        setFavorites(response.favorites.map(fav => fav.itemId));
      } catch (error) {
        // console.error('즐겨찾기 목록 가져오기 오류:', error);
      }
    };

    fetchCategoriesAndItems();
    fetchFavorites();
  }, []);

  // 특정 카테고리에 속한 상품 불러오기
  const fetchItemsByCategory = async (categoryId = null) => {
    try {
      const endpoint = categoryId
        ? `/travelItems/byCategory/${categoryId}`
        : '/travelItems/allItems';

      const response = await axios.get(endpoint);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('상품 불러오기 실패:', error);
    }
  };

  // 최상위 카테고리 선택 시, 해당 카테고리와 모든 하위 카테고리 상품 표시
  const handleCategoryClick = categoryId => {
    setSelectedCategory(categoryId);
    const filteredSubCategories = categories.filter(
      cat => cat.parentCategory?._id === categoryId && cat.subCategories.length > 0
    );

    setSubCategories(filteredSubCategories);
    fetchItemsByCategory(categoryId);
  };

  // 즐겨찾기 토글 핸들러 (클라이언트 상태 업데이트)
  const handleFavoriteToggle = itemId => {
    setFavorites(prevFavorites =>
      prevFavorites.includes(itemId)
        ? prevFavorites.filter(favId => favId !== itemId)
        : [...prevFavorites, itemId]
    );
  };

  return (
    <div className="container mt-4">
      <h2>🛍️ 여행용품 조회</h2>

      {/* 카테고리 버튼 */}
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

      {/* 서브카테고리 버튼 */}
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

      {/* 선택한 카테고리의 상품 리스트 */}
      <div className="row">
        {items.length > 0 ? (
          items.map(item => (
            <div key={item._id} className="col-md-4 mb-4">
              <TravelItemCard
                travelItem={item}
                isFavorite={favorites.includes(item._id)} // 즐겨찾기 상태 전달
                onFavoriteToggle={handleFavoriteToggle} // 상태 업데이트 함수 전달
              />
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
