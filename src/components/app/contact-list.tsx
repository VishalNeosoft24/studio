'use client';

import type { Contact } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Circle, MessageSquarePlus, MoreVertical, Users, CircleDashed, BellOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProfileSheet from './profile-sheet';

interface ContactListProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
}

export default function ContactList({ contacts, selectedContactId, onSelectContact }: ContactListProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileSheetOpen, setProfileSheetOpen] = useState(false);

  const showToast = (title: string) => {
    toast({ title: title, description: 'This feature is not yet implemented.' });
  };
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Input 
          placeholder="Search or start new chat" 
          className="bg-secondary border-none focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-0">
          <div className="p-4">
            <h2 className="text-primary font-semibold text-sm">CONTACTS ON CHATTERBOX</h2>
          </div>
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`flex items-center w-full p-3 hover:bg-secondary transition-colors text-left ${selectedContactId === contact.id ? 'bg-secondary' : ''}`}
              aria-current={selectedContactId === contact.id ? 'page' : undefined}
            >
              <Avatar className="h-10 w-10 mr-3 relative">
                <AvatarImage src={contact.avatarUrl || ''} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium truncate">{contact.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{contact.about || 'Hey there! I am using Chatterbox.'}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
