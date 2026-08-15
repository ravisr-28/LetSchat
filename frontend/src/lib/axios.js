import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? `http://${window.location.hostname}:3000/api`
      : `${import.meta.env.VITE_API_URL || ""}/api`,
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
