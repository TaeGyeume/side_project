import axios from "axios";

const API_URL = "http://localhost:5000/api";

// ✈️ 모든 항공편 가져오기
// export const getFlights = async () => {
//   try {
//     const response = await axios.get(`${API_URL}/flights`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching flights", error);
//     return [];
//   }
// };

// ✈️ 항공편 검색 API (검색 조건 적용)
export const getFlights = async ({ departure, arrival, date, passengers }) => {
  try {
    const response = await axios.get(`${API_URL}/flights`, {
      params: { departure, arrival, date, passengers },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching flights", error);
    return [];
  }
};

// 🎫 예약 생성하기
export const createReservation = async (flightId, passengers) => {
  try {
    const response = await axios.post(`${API_URL}/reservations`, { flightId, passengers }, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error creating reservation", error);
    return null;
  }
};
