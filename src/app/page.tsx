
'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatWindow from '@/components/app/chat-window';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { Separator } from '@/components/ui/separator';
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
  )
}


export default function Home() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { data: contacts, isLoading, isError } = useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  // Automatically select the first contact once data is loaded
  useState(() => {
    if (contacts && contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  });


  const selectedContact = contacts?.find(c => c.id === selectedContactId);

  const handleContactUpdate = (updatedContact: Contact) => {
    // This will be replaced by a mutation query with React Query
    console.log("Contact updated (will be a mutation):", updatedContact);
  };
  
  const handleCloseChat = () => {
    setSelectedContactId(null);
  };

  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        {isLoading ? (
          <ContactListSkeleton />
        ) : isError ? (
          <div className='p-4 text-center text-destructive'>Failed to load contacts.</div>
        ) : (
          <ContactList 
            contacts={contacts || []} 
            selectedContactId={selectedContactId} 
            onSelectContact={setSelectedContactId}
          />
        )}
      </div>
       <Separator orientation="vertical" className="bg-border h-full" />
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <ChatWindow 
            key={selectedContact.id} // Add key to force re-mount and reset state on contact change
            contact={selectedContact} 
            onContactUpdate={handleContactUpdate}
            onCloseChat={handleCloseChat}
          />
        ) : (
          <ChatPlaceholder />
        )}
      </div>
    </div>
  );
}
