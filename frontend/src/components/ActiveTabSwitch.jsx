import React from 'react'
import { useChatStore } from '../store/useChatStore';

const ActiveTabSwitch = () => {
  const {activeTab,setActiveTab} = useChatStore();
  return (
    <div className='tabs tabs-boxed bg-transparent p-2 m-2'>
      <button onClick={()=>setActiveTab("chats")} className={`tab ${activeTab==="chats"?"bg-purple-500/50 text-purple-400": "text-slate-400"}`}>Chats</button>
      <button onClick={()=>setActiveTab("contacts")} className={`tab ${activeTab==="contacts"?"bg-purple-500/50 text-purple-400": "text-slate-400"}`}>Contacts</button>
    </div>
  )
}

export default ActiveTabSwitch
