
'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getContacts } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { data: contacts, isLoading, isError } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  const handleSelectContact = (id: string) => {
    // In a real app, you would check if a chat with this contact
    // already exists. If so, navigate to that chat.
    // Otherwise, you might have an API to create a new chat.
    // For now, we'll just show a toast and navigate back to the main chat page.
    const contact = contacts?.find(c => c.id === id);
    if(contact) {
        toast({
            title: "Starting new chat...",
            description: `This would open a chat with ${contact.name}. This feature is not fully implemented yet.`
        })
    }
    // Simulate navigating to a chat
    router.push('/chat');
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
            selectedContactId={selectedContactId}
            onSelectContact={handleSelectContact}
          />
        )}
      </div>

      {/* Right section - Placeholder */}
      <div className="flex-1 flex flex-col">
        <ChatPlaceholder />
      </div>
    </div>
  );
}
