import axios from '../../api/axios';

/**
 * 국가 목록 가져오기
 * @returns {Promise<Array>} - 국가 목록
 */
export const fetchCountries = async () => {
  return await axios.get('/locations/countries');
};

/**
 * 선택한 국가의 도시 목록 가져오기
 * @param {string} country - 선택한 국가
 * @returns {Promise<Array>} - 도시 목록
 */
export const fetchCities = async country => {
  return await axios.get(`/locations/cities?country=${country}`);
};

/**
 * 새로운 위치 추가
 * @param {Object} locationData - 추가할 위치 데이터
 * @returns {Promise<Object>}
 */
export const createLocation = async locationData => {
  return await axios.post('/locations', locationData);
};

/**
 * 위치 수정
 * @param {string} locationId - 수정할 위치의 ID
 * @param {Object} updatedData - 수정할 데이터
 * @returns {Promise<Object>}
 */
export const updateLocation = async (locationId, updatedData) => {
  return await axios.patch(`/locations/${locationId}`, updatedData);
};
