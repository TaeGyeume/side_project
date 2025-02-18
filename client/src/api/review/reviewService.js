import axios from 'axios';

const BASE_URL = 'http://localhost:5000/reviews';

export const createReview = async formData => {
  return await axios.post(`${BASE_URL}/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getReviews = async (productType, productId) => {
  const response = await axios.get(`${BASE_URL}/${productType}/reviews/${productId}`);
  return response.data;
};

export const updateReview = async (productType, reviewId, updatedData) => {
  const response = await axios.put(
    `${BASE_URL}/${productType}/reviews/${reviewId}`,
    updatedData
  );
  return response.data;
};

export const deleteReview = async (productType, reviewId) => {
  const response = await axios.delete(`${BASE_URL}/${productType}/reviews/${reviewId}`);
  return response.data;
};
