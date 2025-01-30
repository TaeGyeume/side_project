import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 5000,
  withCredentials: true,
});

let isRefreshing = false;


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;


      if (error.response?.status === 401 && !localStorage.getItem("accessToken")) {
        return Promise.resolve();
      }

      if (isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {

        const res = await api.post("/auth/refresh-token");

        if (res.status === 200) {

          api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
          isRefreshing = false;
          return api(originalRequest); // 
        }
      } catch (refreshError) {
        isRefreshing = false;
        if (!localStorage.getItem("userLoggedOut")) {
          localStorage.setItem("userLoggedOut", "true");
          window.location.href = "/login";
        }
      }
    }


    if (error.response?.status === 403) {
      if (!localStorage.getItem("userLoggedOut")) {
        localStorage.setItem("userLoggedOut", "true");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export const logout = async () => {
  try {
    await api.post("/api/auth/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("로그아웃 중 오류가 발생했습니다.", error);
  }
};

export default api;
