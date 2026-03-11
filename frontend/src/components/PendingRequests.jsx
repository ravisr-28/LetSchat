import React, { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { CheckIcon, XIcon } from "lucide-react";

function PendingRequests() {
  const {
    pendingRequests,
    getPendingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading,
  } = useFriendStore();

  useEffect(() => {
    getPendingRequests();
  }, [getPendingRequests]);

  if (isLoading) return <UsersLoadingSkeleton />;
  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
        <p className="text-slate-400 text-sm">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pendingRequests.map((user) => (
        <div
          key={user._id}
          className="bg-purple-500/10 p-3 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-12 rounded-full">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.username}
                />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {user.username}
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => acceptFriendRequest(user._id)}
              className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
              title="Accept"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              onClick={() => declineFriendRequest(user._id)}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              title="Decline"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PendingRequests;
