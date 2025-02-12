import axios from '../../api/axios';

/**
 * 최상위 카테고리 목록 가져오기
 * @returns {Promise<Array>} 최상위 카테고리 목록
 */
export const fetchTopCategories = async () => {
  try {
    const response = await axios.get('/travelItems/topCategories');
    return response.data.topLevelCategories || [];
  } catch (error) {
    console.error('❌ 카테고리 불러오기 실패:', error);
    return [];
  }
};

/**
 * 새로운 카테고리 추가
 * @param {Object} categoryData - 추가할 카테고리 데이터
 * @returns {Promise<Object>} 추가된 카테고리 정보
 */
export const createCategory = async categoryData => {
  return await axios.post('/travelItems/create', categoryData);
};

/**
 * 모든 카테고리 가져오기
 * @returns {Promise<Array>} 카테고리 목록
 */
export const fetchAllCategories = async () => {
  try {
    const response = await axios.get('/travelItems/allCategories');
    return response.data.categories || [];
  } catch (error) {
    console.error('❌ 카테고리 불러오기 실패:', error);
    return [];
  }
};

/**
 * 특정 여행용품 가져오기 (수정 시 사용)
 * @param {string} itemId - 여행용품 ID
 * @returns {Promise<Object>} 여행용품 데이터
 */
export const fetchTravelItem = async itemId => {
  return await axios.get(`/travelItems/${itemId}`);
};

/**
 * 새로운 여행용품 추가
 * @param {FormData} travelItemData - 추가할 여행용품 데이터
 * @returns {Promise<Object>} 추가된 여행용품 정보
 */
export const createTravelItem = async travelItemData => {
  return await axios.post('/travelItems/create', travelItemData, {
    headers: {'Content-Type': 'multipart/form-data'}
  });
};

/**
 * 여행용품 수정
 * @param {string} itemId - 수정할 여행용품 ID
 * @param {FormData} updatedData - 수정할 데이터
 * @returns {Promise<Object>}
 */
export const updateTravelItem = async (itemId, updatedData) => {
  return await axios.patch(`/travelItems/${itemId}`, updatedData, {
    headers: {'Content-Type': 'multipart/form-data'}
  });
};

/**
 * 모든 여행용품 가져오기
 * @returns {Promise<Array>} 여행용품 목록
 */
export const fetchAllTravelItems = async () => {
  try {
    const response = await axios.get('/travelItems/allItems');
    return response.data.items || [];
  } catch (error) {
    console.error('❌ 여행용품 리스트 불러오기 실패:', error);
    throw new Error('상품 데이터를 불러오는 중 오류가 발생했습니다.');
  }
};

/**
 * 여행용품 삭제
 * @param {string} itemId - 삭제할 여행용품 ID
 * @returns {Promise<void>}
 */
export const deleteTravelItem = async itemId => {
  try {
    await axios.delete(`/travelItems/${itemId}`);
  } catch (error) {
    console.error('❌ 여행용품 삭제 중 오류 발생:', error);
    throw new Error('상품 삭제 실패');
  }
};
