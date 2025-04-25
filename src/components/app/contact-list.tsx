'use client';

import type { Contact } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Circle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';

// Mock data - replace with API call in a real application
const mockContacts: Contact[] = [
  { id: '1', name: 'Alice', avatarUrl: 'https://picsum.photos/id/101/50/50', lastMessage: 'Hey, how are you?', timestamp: '10:30 AM', online: true },
  { id: '2', name: 'Bob', avatarUrl: 'https://picsum.photos/id/102/50/50', lastMessage: 'See you later!', timestamp: '9:15 AM', online: false },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/id/103/50/50', lastMessage: 'Okay, sounds good.', timestamp: 'Yesterday', online: true },
  { id: '4', name: 'David', avatarUrl: 'https://picsum.photos/id/104/50/50', lastMessage: 'Let me check that.', timestamp: 'Yesterday', online: false },
   { id: '5', name: 'Eve', avatarUrl: 'https://picsum.photos/id/105/50/50', lastMessage: 'Thanks!', timestamp: 'Mon', online: false },
   { id: '6', name: 'Frank', avatarUrl: 'https://picsum.photos/id/106/50/50', lastMessage: 'Can you send the file?', timestamp: 'Mon', online: true },
   { id: '7', name: 'Grace', avatarUrl: 'https://picsum.photos/id/107/50/50', lastMessage: '👍', timestamp: 'Sun', online: false },
   { id: '8', name: 'Heidi', avatarUrl: 'https://picsum.photos/id/108/50/50', lastMessage: 'I will call you back.', timestamp: 'Sun', online: false },
];

export default function ContactList() {
  const [contacts] = useState<Contact[]>(mockContacts); // Use state for potential filtering/updates
  const [selectedContactId, setSelectedContactId] = useState<string | null>(mockContacts[0]?.id ?? null);

  // TODO: Implement search functionality

  return (
    <>
      <Card className="rounded-none border-0 border-b shadow-none">
        <CardHeader className="p-3">
          <Input placeholder="Search or start new chat" className="bg-secondary border-none focus-visible:ring-primary" />
        </CardHeader>
      </Card>
      <ScrollArea className="flex-1">
        <div className="p-0">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={`flex items-center w-full p-3 hover:bg-secondary transition-colors text-left ${selectedContactId === contact.id ? 'bg-secondary' : ''}`}
              aria-current={selectedContactId === contact.id ? 'page' : undefined}
            >
              <Avatar className="h-10 w-10 mr-3 relative">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                {contact.online && (
                   <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-accent stroke-accent border-2 border-background rounded-full" />
                )}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
