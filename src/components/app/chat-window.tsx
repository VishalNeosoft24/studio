
'use client';

import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Picker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { SendHorizonal, MoreVertical, Video, Info, BellOff, Bell, Trash2, Ban, Download, SquarePlus, Loader2, X, Search, Timer, Wallpaper, AlertTriangle, Paperclip, Mic, Smile, FileText, ImageIcon as ImageIconLucide, User, Vote, Music, MapPin, CalendarPlus, Camera } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ContactInfoSheet from './contact-info-sheet';
import { getCurrentUserId } from '@/lib/api';
import { useChat } from '@/hooks/use-chat';
import MessageBubble from './message-bubble';
import type { Chat, Participant } from '@/types';
import CameraViewDialog from './camera-view-dialog';

interface ChatWindowProps {
  chat: Chat;
}

function ChatWindow({ chat }: ChatWindowProps) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const currentUserId = getCurrentUserId();
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const {
    messages,
    typingUsers,
    sendMessage,
    sendImageMessage,
    sendTyping,
    sendReadStatus,
    presence,
  } = useChat(chat.id);

  const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
    sendTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setText(newValue);
    sendTyping(newValue.length > 0);
  };
  
  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setText(prevInput => prevInput + emoji.emoji);
  };

  const showToast = (title: string, description?: string) => {
    toast({ title, description: description || 'This feature is not yet implemented.' });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      sendImageMessage(file);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid Data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapture = (dataUrl: string) => {
    const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.png`);
    sendImageMessage(file);
  };


  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({ title: !isMuted ? `Notifications muted for ${chat.chat_display_name}` : `Notifications unmuted for ${chat.chat_display_name}` });
  };

  const toggleBlock = () => {
    setIsBlocked(!isBlocked);
    toast({ title: !isBlocked ? `${otherParticipant?.username} has been blocked` : `${otherParticipant?.username} has been unblocked`, variant: !isBlocked ? 'destructive' : 'default' });
  };
  
  const getStatusText = () => {
    if (isBlocked) return 'Blocked';
    if (typingUsers.length > 0) return 'typing...';
    const otherParticipantPresence = presence[otherParticipant?.id ?? -1];
    if (otherParticipantPresence?.is_online) return 'Online';
    if (otherParticipantPresence?.last_seen) {
        return `Last seen at ${new Date(otherParticipantPresence.last_seen).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        })}`
    }
    return 'Offline';
  };

  const otherParticipantSafe: Participant = otherParticipant || { id: -1, username: 'Unknown', phone_number: 'N/A', profile_picture_url: null, display_name: 'Unknown', is_online: false, last_seen: null };

  if (!chat) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <ContactInfoSheet participant={otherParticipantSafe} open={isContactInfoOpen} onOpenChange={setContactInfoOpen} />
      <CameraViewDialog open={isCameraOpen} onOpenChange={setIsCameraOpen} onCapture={handleCapture} />

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
                  <AvatarFallback>{chat.chat_display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="cursor-pointer" onClick={() => setContactInfoOpen(true)}>
                  <h2 className="font-semibold flex items-center">{chat.chat_display_name} {isMuted && <BellOff className="h-4 w-4 ml-2 text-muted-foreground"/>}</h2>
                  <p className="text-xs text-muted-foreground">{getStatusText()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Video call')}><Video className="h-5 w-5" /><span className="sr-only">Video call</span></Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsSearchOpen(true)}><Search className="h-5 w-5" /><span className="sr-only">Search</span></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /><span className="sr-only">More options</span></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setContactInfoOpen(true)}><Info className="mr-2 h-4 w-4" /><span>Contact info</span></DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleMute}>{isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}<span>{isMuted ? 'Unmute' : 'Mute'} notifications</span></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => showToast('Disappearing messages')}><Timer className="mr-2 h-4 w-4" /><span>Disappearing messages</span></DropdownMenuItem>
                    <DropdownMenuItem onClick={() => showToast('Wallpaper')}><Wallpaper className="mr-2 h-4 w-4" /><span>Wallpaper</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><span>More</span></DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => showToast('Report')}><AlertTriangle className="mr-2 h-4 w-4" /><span>Report</span></DropdownMenuItem>
                        <DropdownMenuItem className={isBlocked ? '' : 'text-destructive'} onClick={toggleBlock}><Ban className="mr-2 h-4 w-4" /><span>{isBlocked ? 'Unblock' : 'Block'}</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Clear Chat', 'This would clear messages if implemented.')}><Trash2 className="mr-2 h-4 w-4" /><span>Clear chat</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Export chat')}><Download className="mr-2 h-4 w-4" /><span>Export chat</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Add shortcut')}><SquarePlus className="mr-2 h-4 w-4" /><span>Add shortcut</span></DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <div className="bg-[#ECE5DD] p-4 space-y-2 h-full overflow-y-auto">
            {messages.map((msg, index) => (
              <MessageBubble
                key={`${msg.temp_id || msg.id}`}
                msg={msg}
                currentUserId={currentUserId!}
                showDateBanner={index === 0 || new Date(messages[index - 1].created_at!).toDateString() !== new Date(msg.created_at!).toDateString()}
                onVisible={(id) => {
                  if (msg.sender !== currentUserId && !msg.pending) {
                     sendReadStatus(id);
                  }
                }}
              />
            ))}
            <div ref={bottomRef} />
          </div>
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
          <CardFooter className="p-3 border-t bg-secondary">
            <form onSubmit={handleSend} className="w-full flex items-center space-x-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground flex-shrink-0">
                        <Smile className="h-5 w-5" /><span className="sr-only">Add emoji</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0" side="top" align="start">
                    <Picker 
                        onEmojiClick={handleEmojiSelect}
                        autoFocusSearch={false}
                        emojiStyle={EmojiStyle.NATIVE}
                        theme="auto"
                    />
                    </PopoverContent>
                </Popover>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground flex-shrink-0"><Paperclip className="h-5 w-5" /><span className="sr-only">Attach file</span></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => showToast('Document sending not implemented')}><FileText className="mr-2 h-4 w-4" /><span>Document</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><ImageIconLucide className="mr-2 h-4 w-4" /><span>Gallery</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsCameraOpen(true)}><Camera className="mr-2 h-4 w-4" /><span>Camera</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Audio sending not implemented')}><Music className="mr-2 h-4 w-4" /><span>Audio</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Location sending not implemented')}><MapPin className="mr-2 h-4 w-4" /><span>Location</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Contact sharing not implemented')}><User className="mr-2 h-4 w-4" /><span>Contact</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Polls not implemented')}><Vote className="mr-2 h-4 w-4" /><span>Poll</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Events not implemented')}><CalendarPlus className="mr-2 h-4 w-4" /><span>Event</span></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Input
                    type="text"
                    placeholder='Type a message'
                    value={text}
                    onChange={handleInputChange}
                    onBlur={() => sendTyping(false)}
                    className="flex-1 bg-background border-input focus-visible:ring-primary rounded-full px-4 h-10"
                    autoComplete="off"
                />
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button type="submit" size="icon" className={`rounded-full w-12 h-12 flex-shrink-0 ${text.trim() ? "bg-[#128C7E]" : "bg-[#25D366]"}`}>
                    {text.trim() ? <SendHorizonal /> : <Mic />}
                    <span className="sr-only">Send</span>
                </Button>
            </form>
          </CardFooter>
        )}
      </Card>
    </>
  );
}

export default React.memo(ChatWindow);

    