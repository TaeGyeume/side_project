import axios from 'axios';

export const createReview = async (productType, reviewData) => {
  const response = await axios.post(`/${productType}/reviews/create`, reviewData);
  return response.data;
};

export const getReviews = async (productType, productId) => {
  const response = await axios.get(`/${productType}/reviews/${productId}`);
  return response.data;
};

export const updateReview = async (productType, reviewId, updatedData) => {
  const response = await axios.put(`/${productType}/reviews/${reviewId}`, updatedData);
  return response.data;
};

export const deleteReview = async (productType, reviewId) => {
  const response = await axios.delete(`/${productType}/reviews/${reviewId}`);
  return response.data;
};
