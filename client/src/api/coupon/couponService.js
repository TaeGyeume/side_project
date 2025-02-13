import axios from '../../api/axios';

/**
 * ✅ 새로운 쿠폰 추가
 * @param {Object} couponData - 추가할 쿠폰 데이터
 * @returns {Promise<Object>}
 */
export const createCoupon = async couponData => {
  return await axios.post('/coupons', couponData);
};

/**
 * ✅ 모든 쿠폰 가져오기
 * @returns {Promise<Array>} - 쿠폰 목록
 */
export const fetchCoupons = async () => {
  try {
    const response = await axios.get('/coupons');
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: '쿠폰 목록 조회 중 오류 발생'};
  }
};

/**
 * ✅ 유저의 등급에 맞는 쿠폰 가져오기
 * @param {string} membershipLevel - 현재 유저의 등급
 * @returns {Promise<Array>} - 해당 등급의 쿠폰 목록
 */
export const fetchCouponsByMembership = async membershipLevel => {
  try {
    const response = await axios.get(
      `/coupons/membership?membershipLevel=${membershipLevel}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: '쿠폰 목록 조회 중 오류 발생'};
  }
};

/**
 * ✅ 유저가 쿠폰 다운로드 (쿠폰 받기)
 * @param {string} userId - 유저 ID
 * @param {string} couponId - 받을 쿠폰 ID
 * @returns {Promise<Object>}
 */
export const claimCoupon = async (userId, couponId) => {
  try {
    const response = await axios.post('/user-coupons/claim', {userId, couponId});
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: '쿠폰 다운로드 중 오류 발생'};
  }
};

/**
 * ✅ 특정 쿠폰 삭제하기
 * @param {string} couponId - 삭제할 쿠폰의 ID
 */
export const deleteCoupon = async couponId => {
  try {
    const response = await axios.delete(`/coupons/${couponId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || {message: '쿠폰 삭제 중 오류 발생'};
  }
};
