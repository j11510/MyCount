import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Nginx 프록시를 통한 상대 경로 (/api) 무조건 사용
    return '/api';
  }
  return 'http://localhost:8000';
};

const api = axios.create({
  baseURL: getBaseURL(),
});


api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mycount_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mycount_token");
    window.location.href = "/login";
  }
}

export default api;
