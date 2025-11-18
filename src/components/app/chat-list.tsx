
'use client';

import type { Chat, User } from "@/types";
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
import { logout, getCurrentUserId, getProfile } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";


type ChatListProps = {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
};

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileSheetOpen, setProfileSheetOpen] = useState(false);
  const currentUserId = getCurrentUserId();

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
      queryKey: ['profile'],
      queryFn: getProfile,
  });

  const showToast = (title: string) => {
    toast({ title: title, description: 'This feature is not yet implemented.' });
  };
  
  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
  };

  const filteredChats = chats.filter(chat => 
    chat.chat_display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatDisplayData = (chat: Chat) => {
    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
    
    return {
      name: chat.chat_display_name,
      avatarUrl: otherParticipant?.profile_picture_url,
      fallback: chat.chat_display_name?.[0]?.toUpperCase() || '?',
    };
  };

  const getAvatarFallback = (name?: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length > 1 && parts[1]) {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <ProfileSheet open={isProfileSheetOpen} onOpenChange={setProfileSheetOpen} />
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
            const { name, avatarUrl, fallback } = getChatDisplayData(chat);
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  'flex items-center w-full p-3 hover:bg-secondary transition-colors text-left',
                  selectedChatId === chat.id && 'bg-muted hover:bg-muted'
                )}
                aria-current={selectedChatId === chat.id ? 'page' : undefined}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {/* Placeholder for last message */}
                    {chat.last_message?.content}
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
