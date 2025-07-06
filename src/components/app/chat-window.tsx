'use client';

import type { Message, Contact } from '@/types';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SendHorizonal, Check, CheckCheck, Circle, Paperclip, Smile, MoreVertical, Phone, Video, Info, BellOff, Bell, Trash2, XCircle, Ban, FileText, ImageIcon as ImageIconLucide, Camera, User, Vote, AlertTriangle, X } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ContactInfoSheet from './contact-info-sheet';
import CameraViewDialog from './camera-view-dialog';
import { getMockMessages } from '@/lib/mock-data';

const EMOJIS = ['😀', '😂', '❤️', '👍', '🙏', '😭', '🎉', '🤔', '🔥', '😊', '😎', '💯'];

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
  
  const [isContactInfoOpen, setContactInfoOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        (scrollAreaRef.current.firstChild as HTMLDivElement).scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const showToast = (title: string) => {
    toast({ title: title, description: 'This feature is not yet implemented.' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' && !imageToSend) return;

    if (imageToSend) {
       const messageToSend: Message = {
        id: `m${messages.length + 1}`,
        sender: 'me',
        type: 'image',
        text: newMessage, // Caption
        imageUrl: imageToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
       };
       setMessages([...messages, messageToSend]);
       setImageToSend(null);
    } else {
       const messageToSend: Message = {
        id: `m${messages.length + 1}`,
        sender: 'me',
        type: 'text',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
       };
       setMessages([...messages, messageToSend]);
    }
    
    setNewMessage('');
    
    // Simulate receiving a reply
    setTimeout(() => {
        const reply: Message = {
          id: `m${messages.length + 2}`,
          sender: 'contact',
          type: 'text',
          text: 'Got it!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, reply]);
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
  
  const handleCapture = (dataUrl: string) => {
      setImageToSend(dataUrl);
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
            <p className="text-xs text-muted-foreground">{contact.isBlocked ? 'Blocked' : contact.status === 'online' ? 'Online' : contact.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Video call')}><Video className="h-5 w-5" /><span className="sr-only">Video call</span></Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => showToast('Voice call')}><Phone className="h-5 w-5" /><span className="sr-only">Voice call</span></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /><span className="sr-only">More options</span></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setContactInfoOpen(true)}><Info className="mr-2 h-4 w-4" /><span>Contact info</span></DropdownMenuItem>
                <DropdownMenuItem onClick={toggleMute}>{contact.isMuted ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}<span>{contact.isMuted ? 'Unmute' : 'Mute'} notifications</span></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setMessages([]); showToast('Messages cleared'); }}><Trash2 className="mr-2 h-4 w-4" /><span>Clear messages</span></DropdownMenuItem>
                <DropdownMenuItem onClick={onCloseChat}><XCircle className="mr-2 h-4 w-4" /><span>Close chat</span></DropdownMenuItem>
                <DropdownMenuItem className={contact.isBlocked ? '' : 'text-destructive'} onClick={toggleBlock}><Ban className="mr-2 h-4 w-4" /><span>{contact.isBlocked ? 'Unblock' : 'Block'}</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
           <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${msg.sender === 'me' ? 'message-bubble-outbound' : 'message-bubble-inbound'}`}>
                  {msg.type === 'image' && msg.imageUrl && (
                      <div className="relative w-64 h-64 mb-2">
                        <Image src={msg.imageUrl} alt="Sent image" layout="fill" objectFit="cover" className="rounded-md"/>
                      </div>
                  )}
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                     {msg.sender === 'me' && getStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            ))}
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
            <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-6 gap-1">
                    {EMOJIS.map(emoji => (
                        <button key={emoji} type="button" onClick={() => setNewMessage(newMessage + emoji)} className="text-2xl rounded-md p-1 hover:bg-secondary transition-colors">{emoji}</button>
                    ))}
                </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground flex-shrink-0"><Paperclip className="h-5 w-5" /><span className="sr-only">Attach file</span></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => showToast('Attach Document')}><FileText className="mr-2 h-4 w-4" /><span>Document</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><ImageIconLucide className="mr-2 h-4 w-4" /><span>Photos & videos</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCameraOpen(true)}><Camera className="mr-2 h-4 w-4" /><span>Camera</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Share Contact')}><User className="mr-2 h-4 w-4" /><span>Contact</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Create Poll')}><Vote className="mr-2 h-4 w-4" /><span>Poll</span></DropdownMenuItem>
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
