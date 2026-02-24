import React from "react";
import AnimatedBorderContainer from "../components/AnimatedBorderContainer";
import { useChatStore } from "../store/useChatStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
function ChatPage() {
  const { activeTab,selectedUser } = useChatStore();
  return (
    <div className="relative w-full max-w-4xl h-[650px]">
      <AnimatedBorderContainer>
        {/* Left Side */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
          </div>
        </div>

        {/* Right Side */}

        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
    {selectedUser ? <ChatContainer />: <NoConversationPlaceholder />}
        </div>
      </AnimatedBorderContainer>
    </div>
  );
}

export default ChatPage;
