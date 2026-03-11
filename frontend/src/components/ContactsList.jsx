import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlusIcon, XCircleIcon } from "lucide-react";

function ContactsList() {
  const { getAllContacts, allContacts, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const {
    friends,
    sentRequestIds,
    sendFriendRequest,
    cancelFriendRequest,
    getSentRequests,
  } = useFriendStore();

  useEffect(() => {
    getAllContacts();
    getSentRequests();
  }, [getAllContacts, getSentRequests]);

  const friendIds = friends.map((f) => f._id);
  const nonFriends = allContacts.filter((c) => !friendIds.includes(c._id));

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (nonFriends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
        <p className="text-slate-400 text-sm">No new people to add</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nonFriends.map((contact) => {
        const isPending = sentRequestIds.includes(contact._id);
        return (
          <div
            key={contact._id}
            className="bg-purple-500/10 p-3 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}
              >
                <div className="size-12 rounded-full">
                  <img
                    src={contact.profilePic || "/avatar.png"}
                    alt={contact.username}
                  />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">
                {contact.username}
              </h4>
            </div>
            {isPending ? (
              <button
                onClick={() => cancelFriendRequest(contact._id)}
                className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Cancel request"
              >
                <XCircleIcon className="size-3" /> Cancel
              </button>
            ) : (
              <button
                onClick={() => sendFriendRequest(contact._id)}
                className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full hover:bg-purple-500/20 transition-colors"
              >
                <UserPlusIcon className="size-3" /> Add
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ContactsList;
