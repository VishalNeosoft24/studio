
'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getContacts, createChat, getCurrentUserId } from '@/lib/api';
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

  const { data: contacts, isLoading, isError } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  const handleSelectContact = async (id: string) => {
    setIsCreatingChat(id);
    const contact = contacts?.find(c => c.id === id);
    const currentUserId = getCurrentUserId();

    if (!contact || !currentUserId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create chat. User or contact not found.',
      });
      setIsCreatingChat(null);
      return;
    }
    
    try {
      // The backend might return an existing chat or create a new one.
      await createChat({
        name: contact.name,
        chat_type: 'private',
        participant_ids: [currentUserId, parseInt(id, 10)],
      });
      
      // Invalidate the chats query to refetch the list on the main page
      await queryClient.invalidateQueries({ queryKey: ['chats'] });

      toast({
        title: 'Chat started!',
        description: `Your chat with ${contact.name} is ready.`,
      });

      // Redirect to the chat page where the new chat will appear
      router.push('/chat');

    } catch (error: any) {
      console.error('Failed to create chat:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to create chat',
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
        {isLoading ? (
          <ContactListSkeleton />
        ) : isError ? (
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
                <h2 className="text-xl font-semibold">Starting new chat...</h2>
            </div>
        ) : (
            <ChatPlaceholder />
        )}
      </div>
    </div>
  );
}
