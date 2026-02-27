import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactsList() {
  const { getAllContacts, allContacts, isUsersLoading, setSelectedUser } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);
  if (isUsersLoading) return <UsersLoadingSkeleton />;
  return (
    <div className="space-y-2">
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          onClick={() => setSelectedUser(contact)}
          className="bg-purple-500/10 p-3 rounded-lg cursor-pointer hover:bg-purple-500/20 transition-colors "
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
        </div>
      ))}
    </div>
  );
}

export default ContactsList;
