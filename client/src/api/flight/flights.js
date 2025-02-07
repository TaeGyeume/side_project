import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // ✅ API 기본 URL

// 모든 항공편 가져오기
export const fetchFlights = async () => {
  try {
    console.log('📡 항공편 리스트 요청...');
    const response = await axios.get(`${API_URL}/flights`); // ✅ URL 명확히 설정
    // console.log("✅ 응답 데이터:", response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 모든 항공편 데이터를 불러오는 데 실패했습니다:', error);
    return [];
  }
};

export const searchFlights = async (departure, arrival, date) => {
  try {
    const response = await axios.get(`${API_URL}/flights/search`, {
      params: {departure, arrival, date}
    });
    return response.data;
  } catch (error) {
    console.error('🚨 검색 API 오류:', error.response?.data || error.message);
    return [];
  }
};
