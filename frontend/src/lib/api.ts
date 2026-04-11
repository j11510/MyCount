import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8005',
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
