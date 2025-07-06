'use client';

import type { Message, Contact } from '@/types';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SendHorizonal, Check, CheckCheck, Circle, Paperclip, Smile, MoreVertical, Phone, Video, Info, BellOff, Bell, Trash2, Ban, FileText, ImageIcon as ImageIconLucide, Camera, User, Vote, AlertTriangle, X, Search, Music, MapPin, CalendarPlus, Timer, Wallpaper, Download, SquarePlus } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ContactInfoSheet from './contact-info-sheet';
import CameraViewDialog from './camera-view-dialog';
import { getMockMessages } from '@/lib/mock-data';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import Picker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';


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
  contact: Contact;
  onContactUpdate: (contact: Contact) => void;
  onCloseChat: () => void;
}

export default function ChatWindow({ contact, onContactUpdate, onCloseChat }: ChatWindowProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(getMockMessages(contact.id));
  const [newMessage, setNewMessage] = useState('');
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const showToast = (title: string, description?: string) => {
    toast({ title, description: description || 'This feature is not yet implemented.' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' && !imageToSend) return;

    let messageToSend: Message;

    if (imageToSend) {
       messageToSend = {
        id: `m${Date.now()}`,
        sender: 'me',
        type: 'image',
        text: newMessage, // Caption
        imageUrl: imageToSend,
        timestamp: new Date(),
        status: 'sent',
       };
       setImageToSend(null);
    } else {
       messageToSend = {
        id: `m${Date.now()}`,
        sender: 'me',
        type: 'text',
        text: newMessage,
        timestamp: new Date(),
        status: 'sent',
       };
    }
    
    setMessages(prev => [...prev, messageToSend]);
    setNewMessage('');
    
    setIsTyping(true);
    setTimeout(() => {
        const reply: Message = {
          id: `m${Date.now() + 1}`,
          sender: 'contact',
          type: 'text',
          text: 'Got it!',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, reply]);
        setIsTyping(false);
    }, 1500);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              setImageToSend(event.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };
  
  const handleSendDocument = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'document',
      text: 'Project Briefing',
      document: { name: 'project-brief.pdf', size: '1.2 MB' },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Document sent' });
  };
  
  const handleShareContact = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'contact',
      text: '',
      contactInfo: { name: 'Charlie', avatarUrl: 'https://picsum.photos/id/103/50/50' },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Contact shared' });
  };
  
  const handleSendPoll = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'poll',
      text: '',
      poll: { question: 'Where should we go for lunch?', options: ['Italian Place', 'Sushi Bar', 'Taco Truck'] },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Poll created' });
  };

  const handleSendAudio = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'audio',
      text: '',
      audio: { name: 'voice-message.mp3', duration: '0:34' },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Audio message sent' });
  };

  const handleSendLocation = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'location',
      text: '',
      location: { address: '123 Main Street, Anytown, USA' },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Location shared' });
  };

  const handleSendEvent = () => {
    const messageToSend: Message = {
      id: `m${Date.now()}`,
      sender: 'me',
      type: 'event',
      text: '',
      event: { title: 'Team Meeting', dateTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) },
      timestamp: new Date(),
      status: 'sent',
    };
    setMessages(prev => [...prev, messageToSend]);
    toast({ title: 'Event created' });
  };
  
  const handleCapture = (dataUrl: string) => {
      setImageToSend(dataUrl);
  };

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setNewMessage(prevInput => prevInput + emoji.emoji);
  };
  
  const toggleMute = () => {
      const updatedContact = { ...contact, isMuted: !contact.isMuted };
      onContactUpdate(updatedContact);
      toast({ title: updatedContact.isMuted ? `Notifications muted for ${contact.name}` : `Notifications unmuted for ${contact.name}` });
  }

  const toggleBlock = () => {
      const updatedContact = { ...contact, isBlocked: !contact.isBlocked };
      onContactUpdate(updatedContact);
      toast({ title: updatedContact.isBlocked ? `${contact.name} has been blocked` : `${contact.name} has been unblocked`, variant: updatedContact.isBlocked ? 'destructive' : 'default' });
  }

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'read': return <CheckCheck className="h-4 w-4 text-accent" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case 'sent': return <Check className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  }

  return (
    <>
    <ContactInfoSheet contact={contact} open={isContactInfoOpen} onOpenChange={setContactInfoOpen} />
    <CameraViewDialog open={isCameraOpen} onOpenChange={setCameraOpen} onCapture={handleCapture} />

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
            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
             {contact.status === 'online' && !contact.isBlocked && (
                 <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-accent stroke-accent border-2 border-background rounded-full" />
              )}
          </Avatar>
          <div className="cursor-pointer" onClick={() => setContactInfoOpen(true)}>
            <h2 className="font-semibold flex items-center">{contact.name} {contact.isMuted && <BellOff className="h-4 w-4 ml-2 text-muted-foreground"/>}</h2>
            <p className="text-xs text-muted-foreground">{contact.isBlocked ? 'Blocked' : isTyping ? 'typing...' : contact.status === 'online' ? 'Online' : contact.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Video call', 'This feature is not yet implemented.')}><Video className="h-5 w-5" /><span className="sr-only">Video call</span></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => setIsSearchOpen(true)}><Search className="h-5 w-5" /><span className="sr-only">Search</span></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /><span className="sr-only">More options</span></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setContactInfoOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Contact info</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleMute}>
                    {contact.isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                    <span>{contact.isMuted ? 'Unmute' : 'Mute'} notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Disappearing messages', 'This feature is not yet implemented.')}>
                    <Timer className="mr-2 h-4 w-4" />
                    <span>Disappearing messages</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Wallpaper', 'This feature is not yet implemented.')}>
                    <Wallpaper className="mr-2 h-4 w-4" />
                    <span>Wallpaper</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <span>More</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => showToast('Report', 'This feature is not yet implemented.')}>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            <span>Report</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className={contact.isBlocked ? '' : 'text-destructive'} onClick={toggleBlock}>
                            <Ban className="mr-2 h-4 w-4" />
                            <span>{contact.isBlocked ? 'Unblock' : 'Block'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setMessages([]); toast({ title: 'Chat cleared' }); }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Clear chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Export chat', 'This feature is not yet implemented.')}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Export chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showToast('Add shortcut', 'This feature is not yet implemented.')}>
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
            {messages.map((msg, index) => {
              const showDateSeparator = index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
              
              return (
              <React.Fragment key={msg.id}>
                {showDateSeparator && <DateSeparator date={msg.timestamp} />}
                <div className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`message-bubble ${msg.sender === 'me' ? 'message-bubble-outbound' : 'message-bubble-inbound'}`}>
                    {msg.type === 'image' && msg.imageUrl && (
                        <div className="relative w-64 h-64 mb-1">
                          <Image src={msg.imageUrl} alt="Sent image" layout="fill" objectFit="cover" className="rounded-md"/>
                        </div>
                    )}
                    {msg.type === 'document' && msg.document && (
                        <div className="flex items-center p-2 rounded-md bg-black/5 dark:bg-white/5 mb-1">
                          <FileText className="h-10 w-10 mr-3 text-primary" />
                          <div>
                            <p className="font-medium truncate">{msg.document.name}</p>
                            <p className="text-xs text-muted-foreground">{msg.document.size}</p>
                          </div>
                        </div>
                      )}
                      {msg.type === 'contact' && msg.contactInfo && (
                        <div className="flex items-center p-2 rounded-md bg-black/5 dark:bg-white/5 w-64 mb-1">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={msg.contactInfo.avatarUrl} alt={msg.contactInfo.name} />
                              <AvatarFallback>{msg.contactInfo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 overflow-hidden'>
                                <p className="font-medium truncate">{msg.contactInfo.name}</p>
                                <p className='text-xs text-muted-foreground'>Contact</p>
                            </div>
                            <Button variant="outline" size="sm" className='ml-2' onClick={() => showToast('View Contact', 'This would open the contact info.')}>View</Button>
                        </div>
                      )}
                      {msg.type === 'poll' && msg.poll && (
                        <div className="space-y-2 w-64 mb-1">
                            <p className="font-semibold">{msg.poll.question}</p>
                            <div className="space-y-2">
                              {msg.poll.options.map((option, i) => (
                                <Button key={i} variant="outline" className="w-full justify-start" onClick={() => toast({title: `Voted for "${option}"`})}>{option}</Button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground text-right">2 votes</p>
                        </div>
                      )}
                       {msg.type === 'audio' && msg.audio && (
                        <div className="flex items-center p-2 rounded-md bg-black/5 dark:bg-white/5 w-64 mb-1">
                            <div className="flex items-center justify-center h-10 w-10 mr-3 bg-primary/20 rounded-full">
                                <Music className="h-5 w-5 text-primary" />
                            </div>
                            <div className='flex-1 overflow-hidden'>
                                <p className="font-medium truncate">{msg.audio.name}</p>
                                <p className="text-xs text-muted-foreground">{msg.audio.duration}</p>
                            </div>
                        </div>
                      )}
                      {msg.type === 'location' && msg.location && (
                          <div className="relative w-64 h-32 mb-1 group">
                              <Image src={`https://placehold.co/400x200.png`} layout="fill" objectFit="cover" className="rounded-md" alt="Location Map" data-ai-hint="map location" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 rounded-md">
                                  <div className="flex items-center text-white">
                                      <MapPin className="h-4 w-4 mr-1"/>
                                      <p className="text-sm font-medium truncate">{msg.location.address}</p>
                                  </div>
                              </div>
                          </div>
                      )}
                      {msg.type === 'event' && msg.event && (
                          <div className="flex items-center p-2 rounded-md bg-black/5 dark:bg-white/5 w-64 mb-1">
                              <div className="flex items-center justify-center h-10 w-10 mr-3">
                                  <CalendarPlus className="h-6 w-6 text-primary" />
                              </div>
                              <div className='flex-1 overflow-hidden'>
                                  <p className="font-semibold truncate">{msg.event.title}</p>
                                  <p className="text-xs text-muted-foreground">{format(msg.event.dateTime, 'PPp')}</p>
                              </div>
                              <Button variant="outline" size="sm" className='ml-2' onClick={() => showToast('View Event', 'This would open event details.')}>View</Button>
                          </div>
                      )}
                    {msg.text && <p className="text-sm">{msg.text}</p>}
                    <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-muted-foreground">{format(msg.timestamp, 'p')}</span>
                       {msg.sender === 'me' && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )})}
            </div>
        </ScrollArea>
        {imageToSend && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-11/12 p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg border">
                <div className="relative">
                    <p className="text-sm font-medium mb-2">Image Preview</p>
                    <Image src={imageToSend} alt="Image preview" width={100} height={100} className="rounded-md" />
                    <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => setImageToSend(null)}><X className="h-4 w-4"/></Button>
                </div>
            </div>
        )}
      </CardContent>

      {contact.isBlocked ? (
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
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
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
                <DropdownMenuItem onClick={handleSendDocument}><FileText className="mr-2 h-4 w-4" /><span>Document</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><ImageIconLucide className="mr-2 h-4 w-4" /><span>Gallery</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCameraOpen(true)}><Camera className="mr-2 h-4 w-4" /><span>Camera</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendAudio}><Music className="mr-2 h-4 w-4" /><span>Audio</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendLocation}><MapPin className="mr-2 h-4 w-4" /><span>Location</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareContact}><User className="mr-2 h-4 w-4" /><span>Contact</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendPoll}><Vote className="mr-2 h-4 w-4" /><span>Poll</span></DropdownMenuItem>
                <DropdownMenuItem onClick={handleSendEvent}><CalendarPlus className="mr-2 h-4 w-4" /><span>Event</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-background border-input focus-visible:ring-primary"
            autoComplete="off"
            disabled={!!imageToSend}
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
            <SendHorizonal className="h-5 w-5" /><span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
      )}
    </Card>
    </>
  );
}
