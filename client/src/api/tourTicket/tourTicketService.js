import axios from 'axios';

const API_URL = 'http://localhost:5000/product/tourTicket';

export const getTourTickets = async () => {
  try {
    const response = await axios.get(`${API_URL}/list`);
    return response.data;
  } catch (error) {
    console.error('상품 목록을 가져오는 중 오류 발생:', error);
    return [];
  }
};

// export const createTourTicket = async formData => {
//   const response = await axios.post(`${API_URL}/new`, formData, {
//     headers: {'Content-Type': 'multipart/form-data'} // Authorization 헤더 제거
//   });

//   return response.data;
// };

export const createTourTicket = async formData => {
  return await axios.post(`${API_URL}/new`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
