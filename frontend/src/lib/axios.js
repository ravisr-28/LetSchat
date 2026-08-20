import axios from "axios";

const BACKEND_URL =
  import.meta.env.MODE === "development"
    ? `http://${window.location.hostname}:3000`
    : import.meta.env.VITE_API_URL || "https://letschat-backend-l8tw.onrender.com";

export const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  timeout: 10000, // 10 second timeout — prevents hanging when backend is unreachable
});


// Attach JWT token from localStorage to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
