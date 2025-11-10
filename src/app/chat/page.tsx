

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
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(() => searchParams.get('chatId'));

  const { data: chats, isLoading, isError } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  // Update selected chat when URL param changes
  useEffect(() => {
    setSelectedChatId(searchParams.get('chatId'));
  }, [searchParams]);

  // Update URL when chat is selected from the list
  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    router.push(`/chat?chatId=${id}`, { scroll: false });
  };

  // Automatically select the first chat if no chat is selected via URL
  useEffect(() => {
    if (!selectedChatId && chats && chats.length > 0) {
      handleSelectChat(chats[0].id);
    }
  }, [chats, selectedChatId]); // handleSelectChat is stable

  const selectedChat = chats?.find(c => c.id === selectedChatId);

  const handleCloseChat = () => {
    setSelectedChatId(null);
    router.push('/chat', { scroll: false });
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
        {selectedChat ? (
          <ChatWindow
            key={selectedChat.id}
            chat={selectedChat}
            onCloseChat={handleCloseChat}
          />
        ) : (
          <ChatPlaceholder />
        )}
      </div>
    </div>
  );
}
