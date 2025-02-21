import React, {useState, useEffect} from 'react';
import axios from '../../api/axios';
import TravelItemCard from '../../components/product/travelItems/TravelItemCard';
import {getUserFavorites} from '../../api/user/favoriteService';
import {Box, Button, Typography, CircularProgress} from '@mui/material';

const TravelItemListPage = () => {
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const categoryResponse = await axios.get('/travelItems/allCategories');
        const allCategories = categoryResponse.data.categories || [];

        setCategories(allCategories);
        setTopCategories(allCategories.filter(cat => !cat.parentCategory));

        fetchItemsByCategory(null);
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
        setError('카테고리를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await getUserFavorites();
        setFavorites(response.favorites.map(fav => fav.itemId));
      } catch (error) {
        console.error('즐겨찾기 목록 가져오기 오류:', error);
      }
    };

    fetchCategoriesAndItems();
    fetchFavorites();
  }, []);

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

  const handleCategoryClick = categoryId => {
    setSelectedCategory(categoryId);
    const filteredSubCategories = categories.filter(
      cat => cat.parentCategory?._id === categoryId && cat.subCategories.length > 0
    );

    setSubCategories(filteredSubCategories);
    fetchItemsByCategory(categoryId);
  };

  const handleFavoriteToggle = itemId => {
    setFavorites(prevFavorites =>
      prevFavorites.includes(itemId)
        ? prevFavorites.filter(favId => favId !== itemId)
        : [...prevFavorites, itemId]
    );
  };

  return (
    <Box sx={{maxWidth: 1200, mx: 'auto', mt: 4, p: 2}}>
      {/* 광고 이미지 1 */}
      <Box
        component="img"
        src="/images/travelItem/travelItemad1.jpg"
        alt="광고 배너 1"
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 2
        }}
      />

      {/* 광고 이미지 2 (바로 아래 추가) */}
      <Box
        component="img"
        src="/images/travelItem/travelItemad2.jpg"
        alt="광고 배너 2"
        sx={{
          width: '100%',
          height: 'auto',
          borderRadius: 2,
          mb: 3
        }}
      />

      <Typography variant="h5" fontWeight="bold" mb={3}>
        🛍️ 여행용품 조회
      </Typography>

      {/* 카테고리 버튼 */}
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {topCategories.map(category => (
          <Button
            key={category._id}
            variant={selectedCategory === category._id ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleCategoryClick(category._id)}>
            {category.name}
          </Button>
        ))}
      </Box>

      {/* 서브카테고리 버튼 */}
      {subCategories.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {subCategories.map(subCategory => (
            <Button
              key={subCategory._id}
              variant={selectedCategory === subCategory._id ? 'contained' : 'outlined'}
              color="secondary"
              onClick={() => handleCategoryClick(subCategory._id)}>
              {subCategory.name}
            </Button>
          ))}
        </Box>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {/* 오류 메시지 */}
      {error && (
        <Typography color="error" textAlign="center" my={3}>
          {error}
        </Typography>
      )}

      {/* 상품 리스트 */}
      {!loading && !error && (
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} mb={3}>
          {items.length > 0 ? (
            items.map(item => (
              <TravelItemCard
                key={item._id}
                travelItem={item}
                isFavorite={favorites.includes(item._id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))
          ) : (
            <Typography textAlign="center">하위 카테고리를 선택해 주세요.</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TravelItemListPage;
