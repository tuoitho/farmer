'use client';

import dynamic from 'next/dynamic';
import { Message } from './components/ChatInterface';

interface DoctorChatProps {
  initialMessages: Message[];
  suggestedPrompts: string[];
}

// Import the chat interface with noSSR
const ChatInterface = dynamic<{
  initialMessages: Message[];
  suggestedPrompts: string[];
}>(() => import('./components/ChatInterface').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center h-full">
      <div>Đang tải giao diện trò chuyện...</div>
    </div>
  )
});

export default function DoctorChat({ 
  initialMessages, 
  suggestedPrompts
}: DoctorChatProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-screen w-full md:ml-[60px] lg:ml-[72px] relative">
      <div className="flex-1 overflow-hidden">
        <ChatInterface 
          initialMessages={initialMessages}
          suggestedPrompts={suggestedPrompts}
        />
      </div>
    </div>
  );
}