import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://192.168.1.55:3000/api"
      : "/api",
  withCredentials: true,
});
