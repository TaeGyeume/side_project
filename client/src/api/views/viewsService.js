import axios from '../../api/axios'; // axios 인스턴스를 가져옴

export const fetchPopularProducts = async (limit = 10) => {
  try {
    const response = await axios.get(`/views/popular-products?limit=${limit}`);
    return response.data.products || [];
  } catch (error) {
    console.error('인기 상품 불러오기 실패:', error);
    return [];
  }
};
