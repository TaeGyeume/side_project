import axios from 'axios';

const API_URL = "http://localhost:5000/api"; // ✅ API 기본 URL

// 모든 항공편 가져오기
export const fetchFlights = async () => {
  try {
    console.log("📡 항공편 리스트 요청...");
    const response = await axios.get(`${API_URL}/flights`); // ✅ URL 명확히 설정
    // console.log("✅ 응답 데이터:", response.data);
    return response.data;
  } catch (error) {
    console.error("🚨 모든 항공편 데이터를 불러오는 데 실패했습니다:", error);
    return [];
  }
};

export const searchFlights = async (departure, arrival, date) => {
  try {
    console.log("📡 서버 요청:", { departure, arrival, date }); // ✅ 요청 확인
    const response = await axios.get(`${API_URL}/flights/search`, {
      params: { departure, arrival, date }
    });
    console.log("✅ 서버 응답:", response.data); // ✅ 응답 확인
    return response.data;
  } catch (error) {
    console.error("🚨 API 요청 실패:", error);
    return [];
  }
};


