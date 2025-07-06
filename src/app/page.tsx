'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatWindow from '@/components/app/chat-window';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { Separator } from '@/components/ui/separator';

const initialContacts: Contact[] = [
  { id: '1', name: 'Alice', avatarUrl: 'https://picsum.photos/id/101/50/50', lastMessage: 'Hey, how are you?', lastMessageTimestamp: '10:30 AM', status: 'online', unreadCount: 2, about: 'Designer & Dreamer ✨' },
  { id: '2', name: 'Bob', avatarUrl: 'https://picsum.photos/id/102/50/50', lastMessage: 'See you later!', lastMessageTimestamp: '9:15 AM', status: 'last seen 2 hours ago', about: 'Coffee enthusiast ☕️' },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/id/103/50/50', lastMessage: 'Okay, sounds good.', lastMessageTimestamp: 'Yesterday', status: 'online', unreadCount: 5, about: 'Developer' },
  { id: '4', name: 'David', avatarUrl: 'https://picsum.photos/id/104/50/50', lastMessage: 'Let me check that.', lastMessageTimestamp: 'Yesterday', status: 'last seen yesterday at 8:40 PM', about: 'Currently traveling the world 🌍' },
  { id: '5', name: 'Eve', avatarUrl: 'https://picsum.photos/id/105/50/50', lastMessage: 'Thanks!', lastMessageTimestamp: 'Mon', status: 'last seen on Monday', about: 'Available for work' },
  { id: '6', name: 'Frank', avatarUrl: 'https://picsum.photos/id/106/50/50', lastMessage: 'Can you send the file?', lastMessageTimestamp: 'Mon', status: 'online', about: 'At the gym' },
  { id: '7', name: 'Grace', avatarUrl: 'https://picsum.photos/id/107/50/50', lastMessage: '👍', lastMessageTimestamp: 'Sun', status: 'last seen recently', unreadCount: 1, about: 'Sleeping...' },
  { id: '8', name: 'Heidi', avatarUrl: 'https://picsum.photos/id/108/50/50', lastMessage: 'I will call you back.', lastMessageTimestamp: 'Sun', status: 'last seen a week ago', about: 'Hey there! I am using Chatterbox.' },
];


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
