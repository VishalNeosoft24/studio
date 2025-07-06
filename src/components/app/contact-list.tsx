'use client';

import type { Contact } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Circle, MessageSquarePlus, MoreVertical, Users, CircleDashed } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProfileSheet from './profile-sheet';

// Mock data - replace with API call in a real application
const mockContacts: Contact[] = [
  { id: '1', name: 'Alice', avatarUrl: 'https://picsum.photos/id/101/50/50', lastMessage: 'Hey, how are you?', lastMessageTimestamp: '10:30 AM', status: 'online', unreadCount: 2 },
  { id: '2', name: 'Bob', avatarUrl: 'https://picsum.photos/id/102/50/50', lastMessage: 'See you later!', lastMessageTimestamp: '9:15 AM', status: 'last seen 2 hours ago' },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/id/103/50/50', lastMessage: 'Okay, sounds good.', lastMessageTimestamp: 'Yesterday', status: 'online', unreadCount: 5 },
  { id: '4', name: 'David', avatarUrl: 'https://picsum.photos/id/104/50/50', lastMessage: 'Let me check that.', lastMessageTimestamp: 'Yesterday', status: 'last seen yesterday at 8:40 PM' },
   { id: '5', name: 'Eve', avatarUrl: 'https://picsum.photos/id/105/50/50', lastMessage: 'Thanks!', lastMessageTimestamp: 'Mon', status: 'last seen on Monday' },
   { id: '6', name: 'Frank', avatarUrl: 'https://picsum.photos/id/106/50/50', lastMessage: 'Can you send the file?', lastMessageTimestamp: 'Mon', status: 'online' },
   { id: '7', name: 'Grace', avatarUrl: 'https://picsum.photos/id/107/50/50', lastMessage: '👍', lastMessageTimestamp: 'Sun', status: 'last seen recently', unreadCount: 1 },
   { id: '8', name: 'Heidi', avatarUrl: 'https://picsum.photos/id/108/50/50', lastMessage: 'I will call you back.', lastMessageTimestamp: 'Sun', status: 'last seen a week ago' },
];

export default function ContactList() {
  const { toast } = useToast();
  const [contacts] = useState<Contact[]>(mockContacts); // Use state for potential filtering/updates
  const [selectedContactId, setSelectedContactId] = useState<string | null>(mockContacts[0]?.id ?? null);
  const [isProfileSheetOpen, setProfileSheetOpen] = useState(false);

  const showToast = (title: string) => {
    toast({ title: title, description: 'This feature is not yet implemented.' });
  };

  // TODO: Implement search functionality

  return (
    <>
      <ProfileSheet open={isProfileSheetOpen} onOpenChange={setProfileSheetOpen} />
      <div className="p-3 border-b bg-secondary flex-row items-center justify-between flex">
          <button onClick={() => setProfileSheetOpen(true)} className="rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://picsum.photos/id/42/50/50" alt="My Avatar" data-ai-hint="profile person" />
              <AvatarFallback>YOU</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Communities')}>
              <Users className="h-5 w-5" />
              <span className="sr-only">Communities</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Status')}>
              <CircleDashed className="h-5 w-5" />
              <span className="sr-only">Status</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('New Chat')}>
              <MessageSquarePlus className="h-5 w-5" />
              <span className="sr-only">New Chat</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => showToast('New group')}>New group</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('New community')}>New community</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Starred messages')}>Starred messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Select chats')}>Select chats</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => showToast('Log out')}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
      <div className="p-3 border-b">
        <Input placeholder="Search or start new chat" className="bg-secondary border-none focus-visible:ring-primary" />
      </div>
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
                {contact.status === 'online' && (
                   <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-accent stroke-accent border-2 border-background rounded-full" />
                )}
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">{contact.name}</h3>
                  <span className="text-xs text-muted-foreground">{contact.lastMessageTimestamp}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    {contact.unreadCount && contact.unreadCount > 0 && (
                    <div className="bg-accent text-accent-foreground text-xs font-medium rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center flex-shrink-0">
                        {contact.unreadCount}
                    </div>
                    )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
