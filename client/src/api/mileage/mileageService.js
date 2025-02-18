import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/mileage';

// ✅ 총 마일리지 조회 API
export const fetchMileage = async userId => {
  if (!userId) {
    throw new Error('🚨 userId가 전달되지 않았습니다.');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    console.log('📌 [API] 총 마일리지 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 fetchMileage 실패:', error.response ?? error.message);
    throw error;
  }
};

// ✅ 마일리지 내역 조회 API
export const fetchMileageHistory = async userId => {
  if (!userId) {
    throw new Error('🚨 userId가 전달되지 않았습니다.');
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}/history`); // ✅ 경로 수정
    console.log('📌 [API] 마일리지 내역 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 fetchMileageHistory 실패:', error.response ?? error.message);
    throw error;
  }
};
