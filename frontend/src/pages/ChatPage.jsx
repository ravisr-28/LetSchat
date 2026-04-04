import React, { useEffect } from "react";
import AnimatedBorderContainer from "../components/AnimatedBorderContainer";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import PendingRequests from "../components/PendingRequests";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const { socket } = useAuthStore();
  const {
    subscribeToFriendEvents,
    unsubscribeFromFriendEvents,
    getPendingRequests,
  } = useFriendStore();

  // Subscribe to friend events
  useEffect(() => {
    subscribeToFriendEvents();
    getPendingRequests();
    return () => unsubscribeFromFriendEvents();
  }, []);

  // Global listener: bump chatListVersion on ANY incoming message for chat sorting
  useEffect(() => {
    if (!socket) return;

    const handleGlobalMessage = () => {
      useChatStore.setState((state) => ({
        chatListVersion: state.chatListVersion + 1,
      }));
    };

    socket.on("newMessage", handleGlobalMessage);
    return () => socket.off("newMessage", handleGlobalMessage);
  }, [socket]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "chats":
        return <ChatsList />;
      case "contacts":
        return <ContactsList />;
      case "requests":
        return <PendingRequests />;
      default:
        return <ChatsList />;
    }
  };

  return (
    <div className="relative w-full max-w-4xl h-[100dvh] md:h-[650px]">
      <AnimatedBorderContainer>
        {/* Left Side — Sidebar */}
        <div
          className={`${
            selectedUser ? "hidden md:flex" : "flex"
          } w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Side — Chat */}
        <div
          className={`${
            selectedUser ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-slate-900/50 backdrop-blur-sm`}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </AnimatedBorderContainer>
    </div>
  );
}

export default ChatPage;
