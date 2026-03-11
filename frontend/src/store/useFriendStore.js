import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useFriendStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequestIds: [],
  isLoading: false,

  getFriends: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/friend/list");
      set({ friends: res.data });
    } catch (err) {
      console.log("Error fetching friends:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  getPendingRequests: async () => {
    try {
      const res = await axiosInstance.get("/friend/pending");
      set({ pendingRequests: res.data });
    } catch (err) {
      console.log("Error fetching pending requests:", err);
    }
  },

  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friend/sent");
      set({ sentRequestIds: res.data });
    } catch (err) {
      console.log("Error fetching sent requests:", err);
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/friend/request/${userId}`);
      set({ sentRequestIds: [...get().sentRequestIds, userId] });
      toast.success("Friend request sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  },

  cancelFriendRequest: async (userId) => {
    try {
      await axiosInstance.delete(`/friend/cancel/${userId}`);
      set({
        sentRequestIds: get().sentRequestIds.filter((id) => id !== userId),
      });
      toast.success("Friend request cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    }
  },

  acceptFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.put(`/friend/accept/${userId}`);
      set({
        pendingRequests: get().pendingRequests.filter((u) => u._id !== userId),
        friends: [...get().friends, res.data.friend],
      });
      toast.success("Friend request accepted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept request");
    }
  },

  declineFriendRequest: async (userId) => {
    try {
      await axiosInstance.put(`/friend/decline/${userId}`);
      set({
        pendingRequests: get().pendingRequests.filter((u) => u._id !== userId),
      });
      toast.success("Friend request declined");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to decline request");
    }
  },

  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friend/remove/${userId}`);
      set({
        friends: get().friends.filter((f) => f._id !== userId),
      });
      toast.success("Friend removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove friend");
    }
  },

  // Socket listeners
  subscribeToFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("friendRequestReceived", (user) => {
      set({ pendingRequests: [...get().pendingRequests, user] });
      toast(`${user.username} sent you a friend request!`, { icon: "👋" });
    });

    socket.on("friendRequestAccepted", (user) => {
      set({
        friends: [...get().friends, user],
        sentRequestIds: get().sentRequestIds.filter((id) => id !== user._id),
      });
      toast(`${user.username} accepted your friend request!`, { icon: "🎉" });
    });
  },

  unsubscribeFromFriendEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("friendRequestReceived");
    socket.off("friendRequestAccepted");
  },
}));
