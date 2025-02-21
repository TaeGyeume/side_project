import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // API 기본 URL

// 모든 항공편 가져오기
export const fetchFlights = async () => {
  try {
    const response = await axios.get(`${API_URL}/flights`); // URL 명확히 설정
    return response.data;
  } catch (error) {
    console.error('모든 항공편 데이터를 불러오는 데 실패했습니다:', error);
    return [];
  }
};

// 검색된 항공편 가져오기
export const searchFlights = async (departure, arrival, date, passengers) => {
  try {
    console.log(
      `검색 요청: ${departure} → ${arrival}, 날짜: ${date}, 인원: ${passengers}`
    );

    const response = await axios.get(`${API_URL}/flights/search`, {
      params: {departure, arrival, date, passengers} // 쿼리 파라미터 적용
    });

    console.log('검색 결과:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      // 서버가 응답한 경우 (4xx, 5xx)
      console.error(`검색 API 오류 [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      // 요청은 보내졌지만 응답을 받지 못한 경우
      console.error('검색 API 응답 없음:', error.request);
    } else {
      // 요청 자체가 실패한 경우
      console.error('검색 API 요청 실패:', error.message);
    }
    return [];
  }
};
