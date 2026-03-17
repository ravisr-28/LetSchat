import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

function ChatsList() {
  const { setSelectedUser, chatListVersion } = useChatStore();
  const { getFriends, friends, isLoading } = useFriendStore();
  const { onlineUsers } = useAuthStore();
  const [sortedFriends, setSortedFriends] = useState([]);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  // Sort friends by most recent message
  useEffect(() => {
    if (friends.length === 0) {
      setSortedFriends([]);
      return;
    }

    const fetchLastMessages = async () => {
      try {
        const friendsWithTime = await Promise.all(
          friends.map(async (friend) => {
            try {
              const res = await axiosInstance.get(`/message/${friend._id}`);
              const messages = res.data;
              const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
              return {
                ...friend,
                lastMessageAt: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0,
                lastMessageText: lastMsg?.text || (lastMsg?.image ? "📷 Image" : ""),
              };
            } catch {
              return { ...friend, lastMessageAt: 0, lastMessageText: "" };
            }
          }),
        );
        // Sort by last message time (most recent first), friends with no messages go last
        friendsWithTime.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
        setSortedFriends(friendsWithTime);
      } catch {
        setSortedFriends(friends);
      }
    };

    fetchLastMessages();
  }, [friends, chatListVersion]);

  if (isLoading) return <UsersLoadingSkeleton />;
  if (friends.length === 0) return <NoChatsFound />;

  const displayFriends = sortedFriends.length > 0 ? sortedFriends : friends;

  return (
    <div className="space-y-2">
      {displayFriends.map((friend) => (
        <div
          key={friend._id}
          onClick={() => setSelectedUser(friend)}
          className="bg-purple-500/10 p-3 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${onlineUsers.includes(friend._id) ? "online" : "offline"}`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={friend.profilePic || "/avatar.png"}
                  alt={friend.username}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate">
                {friend.username}
              </h4>
              {friend.lastMessageText && (
                <p className="text-xs text-slate-400 truncate">
                  {friend.lastMessageText}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatsList;
