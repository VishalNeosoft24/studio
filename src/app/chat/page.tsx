
'use client';

import { useState, useEffect } from 'react';
import type { Chat } from '@/types';
import ChatList from '@/components/app/chat-list';
import ChatWindow from '@/components/app/chat-window';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getChats } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';


function ChatListSkeleton() {
  return (
    <div className="p-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: chats, isLoading, isError } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: getChats,
  });
  
  useEffect(() => {
    const chatIdFromUrl = searchParams.get('chatId');
    if (chatIdFromUrl && chats) {
      const chatExists = chats.some(c => c.id === chatIdFromUrl);
      if (chatExists) {
        setSelectedChatId(chatIdFromUrl);
        // Clean the URL by replacing the current entry in the history
        // This prevents the user from being stuck in a loop if they use the back button.
        router.replace('/chat', { scroll: false });
      } else {
        // If the chat ID from the URL doesn't exist in our list, it might be an error or old link.
        // We can either show a toast, or just ignore it. For now, we'll log a warning.
        console.warn(`Chat with ID "${chatIdFromUrl}" not found.`);
        router.replace('/chat', { scroll: false });
      }
    }
  }, [searchParams, chats, router]);


  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
  };

  const selectedChat = chats?.find(c => c.id === selectedChatId);

  const handleCloseChat = () => {
    setSelectedChatId(null);
  };

  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      {/* Left sidebar - Chat list */}
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        {isLoading ? (
          <ChatListSkeleton />
        ) : isError ? (
          <div className="p-4 text-center text-destructive">Failed to load chats.</div>
        ) : (
          <ChatList
            chats={chats || []}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
          />
        )}
      </div>

      <Separator orientation="vertical" className="bg-border h-full" />

      {/* Right section - Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedChatId && selectedChat ? (
            <ChatWindow
              key={selectedChat.id}
              chat={selectedChat}
              onCloseChat={handleCloseChat}
            />
        ) : (
          // If there's no chatId, show the placeholder.
          <ChatPlaceholder />
        )}
      </div>
    </div>
  );
}
