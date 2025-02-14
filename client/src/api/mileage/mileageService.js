// src/services/mileageService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/user-mileages';

// ✅ 마일리지 조회 함수
export const fetchMileage = async userId => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('🚨 마일리지 조회 실패:', error);
    throw error;
  }
};
