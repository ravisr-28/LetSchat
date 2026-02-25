import React from 'react'
import { MessageCircleIcon } from 'lucide-react'
function NoConversationPlaceholder() {
  return (
    <div className='flex flex-col items-center justify-center h-full text-center p-6'>
      <div className='w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center'>
        <MessageCircleIcon className='w-8 h-8 text-purple-500'/>
      </div>
      <h3 className='text-xl font-semibold text-slate-200 mb-2'>Select a conversation</h3>
      <p className='text-slate-400 max-w-md'>Choose someone to chat with from the contacts or continue an existing conversation</p>
    </div>
  )
}

export default NoConversationPlaceholder
