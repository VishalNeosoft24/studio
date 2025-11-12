
'use client';

import type { Message, Chat, ApiMessage, Participant } from '@/types';
import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { SendHorizonal, Check, CheckCheck, MoreVertical, Phone, Video, Info, BellOff, Bell, Trash2, Ban, Download, SquarePlus, Loader2, X, Search, Timer, Wallpaper, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ContactInfoSheet from './contact-info-sheet';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, getCurrentUserId, transformApiMessage } from '@/lib/api';
import { useWebSocket } from '@/hooks/use-web-socket';
import MessageInput from './message-input';


const DateSeparator = ({ date }: { date: Date }) => {
  let label = format(date, 'PPP'); // Fallback to full date format
  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  }

  return (
    <div className="flex justify-center my-2">
      <div className="bg-secondary px-3 py-1 text-xs text-muted-foreground rounded-full shadow-sm">
        {label}
      </div>
    </div>
  );
};


interface ChatWindowProps {
  chat: Chat;
  onCloseChat: () => void;
}

function ChatWindow({ chat, onCloseChat }: ChatWindowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  const currentUserId = getCurrentUserId();
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId) || chat.participants[0];

  const chatDisplayName = chat.chat_display_name;
  
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ApiMessage[], Error, Message[]>({
      queryKey: ['messages', chat.id],
      queryFn: () => getMessages(chat.id),
      select: (apiMessages) => apiMessages.map(transformApiMessage).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime()),
      staleTime: 5000,
  });

  const handleWebSocketMessage = useCallback((messageEvent: MessageEvent) => {
    try {
      const data = JSON.parse(messageEvent.data);
      console.log("📩 WS received:", data);

      if ((data.type === 'chat_message' || data.type === 'chat.message') && data.message) {
        // Optimistically update the UI, then invalidate to refetch and confirm
        const newMessage = transformApiMessage(data.message);
        queryClient.setQueryData<Message[]>(['messages', chat.id], (oldMessages = []) => [...oldMessages, newMessage]);
        queryClient.invalidateQueries({ queryKey: ['messages', chat.id], exact: true });
      } else if (data.type === 'delivery_status') {
        queryClient.setQueryData<Message[]>(['messages', chat.id], (oldMessages = []) =>
          oldMessages.map(m =>
            m.id === data.message_id
              ? { ...m, status: data.status }
              : m
          )
        );
      }
    } catch (e) {
      console.error('Failed to parse incoming WebSocket message', e);
    }
  }, [chat.id, queryClient]);
  
  const { sendMessage, sendImage, isConnected } = useWebSocket(chat.id, handleWebSocketMessage);

  useEffect(() => {
    if (scrollViewportRef.current) {
        setTimeout(() => {
            if (scrollViewportRef.current) {
                scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
            }
        }, 100);
    }
  }, [messages, chat.id]);

  const showToast = (title: string, description?: string) => {
    toast({ title, description: description || 'This feature is not yet implemented.' });
  };
  
  const toggleMute = () => {
      setIsMuted(!isMuted);
      toast({ title: !isMuted ? `Notifications muted for ${chatDisplayName}` : `Notifications unmuted for ${chatDisplayName}` });
  }

  const toggleBlock = () => {
      setIsBlocked(!isBlocked);
      toast({ title: !isBlocked ? `${chatDisplayName} has been blocked` : `${chatDisplayName} has been unblocked`, variant: !isBlocked ? 'destructive' : 'default' });
  }

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'read': return <CheckCheck className="h-4 w-4 text-accent" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case 'sent': return <Check className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  }

  const otherParticipantSafe: Participant = otherParticipant || { id: -1, username: 'Unknown', phone_number: 'N/A', profile_picture_url: null };

  return (
    <>
    <ContactInfoSheet participant={otherParticipantSafe} open={isContactInfoOpen} onOpenChange={setContactInfoOpen} />

    <Card className="flex flex-col h-full w-full rounded-none border-none shadow-none bg-transparent">
      <CardHeader className="p-3 border-b bg-secondary flex-row items-center justify-between">
        {isSearchOpen ? (
          <div className="flex items-center w-full">
            <Search className="h-5 w-5 mr-2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}><X className="h-5 w-5"/></Button>
          </div>
        ) : (
        <>
        <div className="flex items-center">
           <Avatar className="h-10 w-10 mr-3 relative cursor-pointer" onClick={() => setContactInfoOpen(true)}>
            <AvatarImage src={otherParticipantSafe.profile_picture_url ?? undefined} alt={otherParticipantSafe.username} />
            <AvatarFallback>{chatDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="cursor-pointer" onClick={() => setContactInfoOpen(true)}>
            <h2 className="font-semibold flex items-center">{chatDisplayName} {isMuted && <BellOff className="h-4 w-4 ml-2 text-muted-foreground"/>}</h2>
            <p className="text-xs text-muted-foreground">{isBlocked ? 'Blocked' : isTyping ? 'typing...' : (isConnected ? 'Online' : 'Connecting...')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Video call')}><Video className="h-5 w-5" /><span className="sr-only">Video call</span></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsSearchOpen(true)}><Search className="h-5 w-5" /><span className="sr-only">Search</span></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /><span className="sr-only">More options</span></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setContactInfoOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Contact info</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleMute}>
                    {isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'} notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Disappearing messages')}>
                    <Timer className="mr-2 h-4 w-4" />
                    <span>Disappearing messages</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Wallpaper')}>
                    <Wallpaper className="mr-2 h-4 w-4" />
                    <span>Wallpaper</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <span>More</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => showToast('Report')}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Report</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className={isBlocked ? '' : 'text-destructive'} onClick={toggleBlock}>
                            <Ban className="mr-2 h-4 w-4" />
                            <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Clear Chat', 'This would clear messages if implemented.')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Clear chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Export chat')}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Export chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Add shortcut')}>
                            <SquarePlus className="mr-2 h-4 w-4" />
                            <span>Add shortcut</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
           <div className="p-4 space-y-2">
            {isLoadingMessages && messages.length === 0 && (
                 <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            )}
            {messages.map((msg, index) => {
              if (!msg.timestamp || isNaN(msg.timestamp.getTime())) {
                console.error("Invalid message timestamp detected:", msg);
                return null;
              }
              
              const showDateSeparator = index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
              
              return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && <DateSeparator date={msg.timestamp} />}
                <div className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`message-bubble ${msg.sender === 'me' ? 'message-bubble-outbound' : 'message-bubble-inbound'}`}>
                    {msg.type === 'image' && msg.imageUrl && (
                       <div className="relative aspect-square w-64 mb-1 cursor-pointer" onClick={() => window.open(msg.imageUrl || '', '_blank')}>
                           <Image src={msg.imageUrl} alt="Sent image" layout="fill" objectFit="cover" className="rounded-md" />
                        </div>
                    )}
                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-muted-foreground">
                        {format(msg.timestamp, 'p')}
                      </span>
                       {msg.sender === 'me' && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )})}
            </div>
        </ScrollArea>
      </CardContent>

      {isBlocked ? (
        <CardFooter className="p-3 border-t bg-secondary">
          <Alert variant="destructive" className="w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Contact Blocked</AlertTitle>
            <AlertDescription>
              You can't send messages to this contact. <Button variant="link" className="p-0 h-auto" onClick={toggleBlock}>Unblock</Button>
            </AlertDescription>
          </Alert>
        </CardFooter>
      ) : (
        <MessageInput onSendMessage={sendMessage} onSendImage={sendImage} isConnected={isConnected} />
      )}
    </Card>
    </>
  );
}

export default React.memo(ChatWindow);
