'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatWindow from '@/components/app/chat-window';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { Separator } from '@/components/ui/separator';
import { initialContacts } from '@/lib/mock-data';

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContacts[0]?.id ?? null);

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  const handleContactUpdate = (updatedContact: Contact) => {
    setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
  };
  
  const handleCloseChat = () => {
    setSelectedContactId(null);
  };

  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        <ContactList 
          contacts={contacts} 
          selectedContactId={selectedContactId} 
          onSelectContact={setSelectedContactId}
        />
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
