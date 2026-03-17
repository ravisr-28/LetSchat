import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  chatListVersion: 0,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/contact");
      set({ allContacts: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    set({ messages: [...messages, optimisticMessage] });
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: messages.concat(res.data.newMessage), chatListVersion: get().chatListVersion + 1 });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (messageId) => {
    const { messages } = get();
    // Optimistic removal
    set({ messages: messages.filter((m) => m._id !== messageId) });
    try {
      await axiosInstance.delete(`/message/delete/${messageId}`);
    } catch (err) {
      // Revert on error
      set({ messages });
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  },

  deleteChat: async (userId) => {
    try {
      await axiosInstance.delete(`/message/chat/${userId}`);
      set({ messages: [] });
      toast.success("Chat deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete chat");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      const currentMessage = get().messages;
      set({ messages: [...currentMessage, newMessage], chatListVersion: get().chatListVersion + 1 });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((e) => console.log("Audio play failed", e));
      }
    });

    socket.on("messageDeleted", (messageId) => {
      const currentMessages = get().messages;
      set({ messages: currentMessages.filter((m) => m._id !== messageId) });
    });

    socket.on("chatDeleted", (deletedByUserId) => {
      if (selectedUser._id === deletedByUserId) {
        set({ messages: [] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("chatDeleted");
  },
}));
