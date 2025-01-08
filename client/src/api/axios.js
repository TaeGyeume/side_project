import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // 서버 URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
