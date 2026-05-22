import axios from "axios";

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?? "";
const TOKEN_STORAGE_KEY = "auth.token";

export const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
