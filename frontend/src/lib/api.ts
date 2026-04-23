import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // 1. .env에 설정된 값이 있으면 우선 사용 (Build 시점 변수)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    
    // 2. Nginx 프록시를 통한 상대 경로 (/api) 사용
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
