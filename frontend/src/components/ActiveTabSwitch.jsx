import React from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageCircleIcon, UsersIcon } from "lucide-react";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 gap-1 ${activeTab === "chats" ? "bg-purple-500/50 text-purple-400" : "text-slate-400"}`}
      >
        <MessageCircleIcon className="size-4" />
        Chats
      </button>
      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 gap-1 ${activeTab === "contacts" ? "bg-purple-500/50 text-purple-400" : "text-slate-400"}`}
      >
        <UsersIcon className="size-4" />
        Contacts
      </button>
    </div>
  );
};

export default ActiveTabSwitch;
