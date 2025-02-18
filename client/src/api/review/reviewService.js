import axios from 'axios';

const BASE_URL = 'http://localhost:5000/reviews';

export const createReview = async formData => {
  return await axios.post(`${BASE_URL}/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getReviews = async productId => {
  const response = await axios.get(`${BASE_URL}/${productId}`);
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

export const likeReview = async reviewId => {
  const response = await axios.post(`${BASE_URL}/${reviewId}/like`);
  return response.data;
};

export const addComment = async (reviewId, content) => {
  const response = await axios.post(`${BASE_URL}/${reviewId}/comment`, {content});
  return response.data;
};

export const deleteComment = async commentId => {
  const response = await axios.delete(`${BASE_URL}/comment/${commentId}`);
  return response.data;
};
