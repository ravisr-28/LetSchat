import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { setSelectedUser } = useChatStore();
  const { getFriends, friends, isLoading } = useFriendStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  if (isLoading) return <UsersLoadingSkeleton />;
  if (friends.length === 0) return <NoChatsFound />;

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
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
            <h4 className="text-slate-200 font-medium truncate">
              {friend.username}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatsList;
