import axios from 'axios';

const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_URL || '/api';
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
