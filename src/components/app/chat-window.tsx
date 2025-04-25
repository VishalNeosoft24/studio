'use client';

import type { Message, Contact } from '@/types';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, Check, CheckCheck, Circle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

// Mock data - replace with API call in a real application
const mockMessages: Message[] = [
  { id: 'm1', sender: 'contact', text: 'Hey, how are you?', timestamp: '10:28 AM' },
  { id: 'm2', sender: 'me', text: 'Hi Alice! I\'m good, thanks. How about you?', timestamp: '10:29 AM', status: 'read' },
  { id: 'm3', sender: 'contact', text: 'Doing well! Just working on that report.', timestamp: '10:29 AM' },
  { id: 'm4', sender: 'me', text: 'Ah, same here. Almost done?', timestamp: '10:30 AM', status: 'delivered' },
  { id: 'm5', sender: 'contact', text: 'Yeah, pretty much. Need a break soon 😅', timestamp: '10:30 AM' },
   { id: 'm6', sender: 'me', text: 'Tell me about it! Coffee later?', timestamp: '10:31 AM', status: 'sent' },
];

const mockContact: Contact = {
    id: '1', name: 'Alice', avatarUrl: 'https://picsum.photos/id/101/50/50', lastMessage: 'Hey, how are you?', timestamp: '10:30 AM', online: true
};


export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [contact] = useState<Contact>(mockContact); // Assuming we always load Alice for now

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageToSend: Message = {
      id: `m${messages.length + 1}`, // Simple ID generation for demo
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setMessages([...messages, messageToSend]);
    setNewMessage('');

    // Simulate receiving a reply (for demo purposes)
    setTimeout(() => {
        const reply: Message = {
          id: `m${messages.length + 2}`,
          sender: 'contact',
          text: 'Got it!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-4 w-4 text-accent" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  }

  return (
    <Card className="flex flex-col h-full w-full rounded-none border-none shadow-none bg-transparent">
      <CardHeader className="p-3 border-b bg-secondary flex-row items-center justify-between">
        <div className="flex items-center">
           <Avatar className="h-10 w-10 mr-3 relative">
            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
             {contact.online && (
                 <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-accent stroke-accent border-2 border-background rounded-full" />
              )}
          </Avatar>
          <div>
            <h2 className="font-semibold">{contact.name}</h2>
            <p className="text-xs text-muted-foreground">{contact.online ? 'Online' : `Last seen ${contact.timestamp}`}</p>
          </div>
        </div>
        {/* Add more icons here (e.g., call, video, menu) */}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
           <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${msg.sender === 'me' ? 'message-bubble-outbound' : 'message-bubble-inbound'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                     {msg.sender === 'me' && getStatusIcon(msg.status)}
                  </div>
                </div>
              </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-3 border-t bg-secondary">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          {/* Add attachment button here */}
          <Input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-background border-input focus-visible:ring-primary"
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
            <SendHorizonal className="h-5 w-5" />
             <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
