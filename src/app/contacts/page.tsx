

'use client';

import { useState } from 'react';
import type { Contact, Chat } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getContacts, createChat, getCurrentUserId, getChats } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

function ContactListSkeleton() {
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

export default function ContactsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null);

  const { data: contacts, isLoading: isLoadingContacts, isError: isErrorContacts } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  // Fetch existing chats to check against
  const { data: existingChats } = useQuery<Chat[]>({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  const handleSelectContact = async (contactId: string) => {
    setIsCreatingChat(contactId);
    const contact = contacts?.find(c => c.id === contactId);
    const currentUserId = getCurrentUserId();
    const contactUserId = parseInt(contactId, 10);

    if (!contact || !currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create chat. User or contact not found.',
      });
      setIsCreatingChat(null);
      return;
    }
    
    // --- The Core Fix: Check for existing chat first ---
    const foundChat = existingChats?.find(chat => 
        chat.chat_type === 'private' &&
        chat.participants.length === 2 &&
        chat.participants.some(p => p.id === currentUserId) &&
        chat.participants.some(p => p.id === contactUserId)
    );

    if (foundChat) {
        console.log(`Found existing chat (ID: ${foundChat.id}), redirecting...`);
        router.push(`/chat?chatId=${foundChat.id}`);
        // No need to set isCreatingChat to null here as we are navigating away
        return;
    }
    // --- End of fix ---

    console.log("No existing chat found, creating a new one...");
    try {
      const newChat = await createChat({
        name: '', // Pass an empty name for private chats
        chat_type: 'private',
        participant_ids: [currentUserId, contactUserId],
      });
      
      // Manually add the new chat to the query cache to avoid a refetch
      queryClient.setQueryData(['chats'], (oldData: Chat[] | undefined) => {
        return oldData ? [...oldData, newChat] : [newChat];
      });

      // Redirect to the chat page, with the specific chat ID in the URL
      router.push(`/chat?chatId=${newChat.id}`);

    } catch (error: any) {
      console.error('Failed to create chat:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to open chat',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsCreatingChat(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      {/* Left sidebar - Contact list */}
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        {isLoadingContacts ? (
          <ContactListSkeleton />
        ) : isErrorContacts ? (
          <div className="p-4 text-center text-destructive">Failed to load contacts.</div>
        ) : (
          <ContactList
            contacts={contacts || []}
            onSelectContact={handleSelectContact}
            isCreatingChatId={isCreatingChat}
          />
        )}
      </div>

      {/* Right section - Placeholder */}
      <div className="flex-1 flex flex-col">
        {isCreatingChat ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Opening chat...</h2>
            </div>
        ) : (
            <ChatPlaceholder />
        )}
      </div>
    </div>
  );
}
