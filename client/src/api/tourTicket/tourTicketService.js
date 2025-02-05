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

export const getTourTicketById = async id => {
  try {
    const response = await axios.get(`${API_URL}/list/${id}`);
    return response.data;
  } catch (error) {
    console.error('상품 정보를 가져오는 중 오류 발생:', error);
    throw error;
  }
};

export const createTourTicket = async formData => {
  return await axios.post(`${API_URL}/new`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const updateTourTicket = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/modify/${id}`, updatedData, {
      headers: {'Content-Type': 'multipart/form-data'}
    });
    return response.data;
  } catch (error) {
    console.error('상품 수정 중 오류 발생:', error);
    throw error;
  }
};

// export const deleteTourTickets = async ticketIds => {
//   return await axios.delete('http://localhost:5000/product/tourTicket/delete', {
//     data: {ticketIds}
//   });
// };

// 여러 개의 상품 삭제 요청
export const deleteMultipleTourTickets = async ticketIds => {
  return await axios.post(`${API_URL}/remove`, {ticketIds});
};
