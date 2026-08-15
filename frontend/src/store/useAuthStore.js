import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? `http://${window.location.hostname}:3000`
    : import.meta.env.VITE_API_URL || "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    // Abort auth check after 5 seconds so the login page renders quickly
    // even if the backend is slow or unreachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await axiosInstance.get("/auth/check", {
        signal: controller.signal,
      });
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (err) {
      console.log("Error checking auth:", err);
      set({ authUser: null });
    } finally {
      clearTimeout(timeoutId);
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      // Store token in localStorage for cross-domain auth
      if (res.data.token) {
        localStorage.setItem("jwt", res.data.token);
      }
      set({ authUser: res.data.user });
      toast.success("Signup successful!");
      get().connectSocket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      // Store token in localStorage for cross-domain auth
      if (res.data.token) {
        localStorage.setItem("jwt", res.data.token);
      }
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      get().disconnectSocket();
      // Reset related stores — dynamic import to avoid circular dependency
      const { useChatStore } = await import("./useChatStore");
      useChatStore.getState().resetChatState();
      localStorage.removeItem("jwt");
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    } catch (err) {
      // Still clear local state even if API call fails
      localStorage.removeItem("jwt");
      set({ authUser: null, onlineUsers: [], socket: null });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    try {
      const token = localStorage.getItem("jwt");
      const socket = io(BASE_URL, {
        withCredentials: true,
        query: { userId: authUser._id },
        auth: { token },
      });
      socket.connect();
      set({ socket });

      socket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
    } catch (err) {
      console.log("Socket connection not available:", err);
    }
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null });
  },
}));
