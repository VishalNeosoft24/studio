
'use client';

import type { Chat } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import ProfileSheet from './profile-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageSquarePlus, MoreVertical, Users, CircleDashed, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";


type ChatListProps = {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
};

// A (very) simple mock to get the current user ID. 
// In a real app, this would come from a global state/context after login.
const MOCK_CURRENT_USER_ID = 3;

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileSheetOpen, setProfileSheetOpen] = useState(false);

  const showToast = (title: string) => {
    toast({ title: title, description: 'This feature is not yet implemented.' });
  };
  
  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipant = (chat: Chat) => {
    if (chat.chat_type !== 'private' || !chat.participants) {
      return null;
    }
    return chat.participants.find(p => p.id !== MOCK_CURRENT_USER_ID);
  };


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
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => router.push('/contacts')}>
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
          placeholder="Search or start new chat" 
          className="bg-secondary border-none focus-visible:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
       <ScrollArea className="flex-1">
        <div className="p-0">
          {filteredChats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const avatarUrl = otherParticipant?.profile_picture_url || "";
            const fallback = chat.name?.[0]?.toUpperCase() || "?";
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center w-full p-3 hover:bg-secondary transition-colors text-left ${selectedChatId === chat.id ? 'bg-secondary' : ''}`}
                aria-current={selectedChatId === chat.id ? 'page' : undefined}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {/* Placeholder for last message */}
                    Last message...
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </>
  );
}
