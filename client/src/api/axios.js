import axios from 'axios';

// 환경 변수에서 API URL 가져오기
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // 기본 URL
  timeout: 5000 // 요청 제한 시간
});

export default api;
