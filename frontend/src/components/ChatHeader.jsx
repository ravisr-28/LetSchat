import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { ArrowLeftIcon, Trash2Icon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, deleteChat } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEsckey = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleEsckey);
    return () => {
      window.removeEventListener("keydown", handleEsckey);
    };
  }, [selectedUser]);

  const handleDeleteChat = () => {
    if (window.confirm(`Delete all messages with ${selectedUser.username}?`)) {
      deleteChat(selectedUser._id);
    }
  };

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] px-3 md:px-6 flex-1 py-2">
      <div className="flex items-center space-x-3">
        {/* Back button — mobile only */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className={`avatar ${isOnline ? "online" : "offline"}`}>
          <div className="w-10 md:w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.username}
            />
          </div>
        </div>
        <div>
          <h3 className="text-slate-200 font-medium text-sm md:text-base">
            {selectedUser.username}
          </h3>
          <p className="text-xs md:text-sm text-slate-400">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Delete chat button */}
        <button
          onClick={handleDeleteChat}
          className="text-slate-400 hover:text-red-400 transition-colors"
          title="Delete chat"
        >
          <Trash2Icon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        {/* Close button — desktop only */}
        <button
          onClick={() => setSelectedUser(null)}
          className="hidden md:block"
        >
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
