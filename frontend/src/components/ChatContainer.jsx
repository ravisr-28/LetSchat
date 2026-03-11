import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Trash2Icon, LockIcon } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { friends } = useFriendStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const chatContainerRef = useRef(null);

  const isFriend = friends.some((f) => f._id === selectedUser._id);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedUser,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close context menu on click anywhere or scroll
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, []);

  const handleContextMenu = (e, msg) => {
    if (msg.senderId !== authUser._id) return;
    if (msg.isOptimistic) return;
    e.preventDefault();

    // Calculate position relative to viewport, clamped to stay visible
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 50);
    setContextMenu({ x, y, messageId: msg._id });
  };

  const handleDeleteMessage = (e) => {
    e.stopPropagation();
    if (contextMenu) {
      deleteMessage(contextMenu.messageId);
      setContextMenu(null);
    }
  };

  return (
    <>
      <ChatHeader />
      <div
        ref={chatContainerRef}
        className="flex-1 px-3 md:px-6 overflow-y-auto py-8 relative"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? msg.image
                        ? "bg-transparent border border-purple-500 text-white p-0 overflow-hidden"
                        : "bg-purple-600 text-white"
                      : msg.image
                        ? "bg-transparent border border-slate-700 text-slate-200 p-0 overflow-hidden"
                        : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <div className="relative">
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="max-h-60 object-cover"
                      />
                      <span className="absolute bottom-1 right-2 text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded-full">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {msg.text && (
                    <p className={msg.image ? "px-3 py-2" : ""}>{msg.text}</p>
                  )}
                  {!msg.image && (
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.username} />
        )}
      </div>

      {/* Context menu for delete — rendered outside scroll container */}
      {contextMenu && (
        <div
          className="fixed z-[9999] bg-slate-800 border border-slate-600 rounded-lg shadow-2xl py-1 min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleDeleteMessage}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
          >
            <Trash2Icon className="size-4" /> Delete message
          </button>
        </div>
      )}

      {/* Show MessageInput only if friends, otherwise show guard */}
      {isFriend ? (
        <MessageInput />
      ) : (
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <LockIcon className="size-4" />
          <span>You must be friends to send messages</span>
        </div>
      )}
    </>
  );
}

export default ChatContainer;
