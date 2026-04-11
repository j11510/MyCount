import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // 1. .env.local에 설정된 값이 있으면 우선 사용
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    
    // 2. 현재 접속한 도메인(IP)을 기준으로 8000 포트 (백엔드) 연결
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
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
