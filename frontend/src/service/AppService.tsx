import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:3000";
const TOKEN_STORAGE_KEY = "auth.token";

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
