
'use client';

import type { Contact, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageSquarePlus, MoreVertical, Users, CircleDashed, LogOut, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ProfileSheet from './profile-sheet';
import { logout, getProfile } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AddContactDialog from './add-contact-dialog';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface ContactListProps {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
  isCreatingChatId: string | null;
}

export default function ContactList({ contacts, onSelectContact, isCreatingChatId }: ContactListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileSheetOpen, setProfileSheetOpen] = useState(false);
  const [isAddContactOpen, setAddContactOpen] = useState(false);

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
      queryKey: ['profile'],
      queryFn: getProfile,
  });

  const showToast = (title: string, description?: string) => {
    toast({ title: title, description: description || 'This feature is not yet implemented.' });
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };
  
  const getAvatarFallback = (name?: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length > 1 && parts[1]) {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  const registeredContacts = contacts.filter(contact => 
    contact.isRegistered && contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const unregisteredContacts = contacts.filter(contact => 
    !contact.isRegistered && contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ProfileSheet open={isProfileSheetOpen} onOpenChange={setProfileSheetOpen} />
      <AddContactDialog open={isAddContactOpen} onOpenChange={setAddContactOpen} />
      
      <div className="p-3 border-b bg-secondary flex-row items-center justify-between flex">
          <button onClick={() => setProfileSheetOpen(true)} className="rounded-full">
            {isLoadingUser || !user ? (
                <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture_url ?? undefined} alt={user.username} />
                    <AvatarFallback>{getAvatarFallback(user.display_name || user.username)}</AvatarFallback>
                </Avatar>
            )}
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
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => router.push('/chat')}>
              <MessageSquarePlus className="h-5 w-5" />
              <span className="sr-only">Chats</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setAddContactOpen(true)}>New contact</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('New group')}>New group</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('New community')}>New community</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Starred messages')}>Starred messages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Select chats')}>Select chats</DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Settings')}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
      <div className="p-3 border-b">
        <Input 
          placeholder="Search contacts" 
          className="bg-secondary border-none focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-0">
          <button
              onClick={() => setAddContactOpen(true)}
              className="flex items-center w-full p-3 hover:bg-secondary transition-colors text-left"
            >
              <Avatar className="h-10 w-10 mr-3 relative bg-primary text-primary-foreground flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium truncate text-primary">New contact</h3>
              </div>
          </button>

          {registeredContacts.length > 0 && (
            <>
              <div className="p-4">
                <h2 className="text-primary font-semibold text-sm">CONTACTS ON CHATTERBOX</h2>
              </div>
              {registeredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  className="flex items-center w-full p-3 hover:bg-secondary transition-colors text-left"
                  disabled={!!isCreatingChatId}
                  aria-current={isCreatingChatId === contact.id ? 'page' : undefined}
                >
                  <Avatar className="h-10 w-10 mr-3 relative">
                    <AvatarImage src={contact.avatarUrl ?? undefined} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{contact.about || 'Hey there! I am using Chatterbox.'}</p>
                  </div>
                  {isCreatingChatId === contact.id && <Loader2 className="h-5 w-5 animate-spin" />}
                </button>
              ))}
            </>
          )}

          {unregisteredContacts.length > 0 && (
            <>
              <div className="p-4 mt-2">
                <h2 className="text-primary font-semibold text-sm">INVITE TO CHATTERBOX</h2>
              </div>
              {unregisteredContacts.map((contact) => (
                <div key={contact.id} className="flex items-center w-full p-3 text-left">
                  <Avatar className="h-10 w-10 mr-3 relative">
                     <AvatarFallback className="bg-muted-foreground/20 text-foreground">
                        <UserPlus className="h-5 w-5"/>
                     </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => showToast('Invite functionality is not implemented.')}>
                    Invite
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
