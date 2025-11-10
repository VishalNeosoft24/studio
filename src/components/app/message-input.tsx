
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SendHorizonal, Paperclip, Smile, FileText, ImageIcon as ImageIconLucide, Camera, User, Vote, Music, MapPin, CalendarPlus } from 'lucide-react';
import Picker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useToast } from '@/hooks/use-toast';
import CameraViewDialog from './camera-view-dialog';

interface MessageInputProps {
  onSendMessage: (message: string) => boolean;
  isConnected: boolean;
}

export default function MessageInput({ onSendMessage, isConnected }: MessageInputProps) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (title: string, description?: string) => {
    toast({ title, description: description || 'This feature is not yet implemented.' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !isConnected) return;
    
    const success = onSendMessage(newMessage);
    if (success) {
      setNewMessage('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to send message',
        description: 'Could not connect to the server.',
      });
    }
  };

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setNewMessage(prevInput => prevInput + emoji.emoji);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          showToast('Image sending not implemented');
      }
  };

  const handleCapture = (dataUrl: string) => {
      showToast('Image sending not implemented');
  };

  return (
    <>
      <CameraViewDialog open={isCameraOpen} onOpenChange={setCameraOpen} onCapture={handleCapture} />
      <div className="p-3 border-t bg-secondary">
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
                <DropdownMenuItem onClick={() => showToast('Document sending not implemented')}><FileText className="mr-2 h-4 w-4" /><span>Document</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><ImageIconLucide className="mr-2 h-4 w-4" /><span>Gallery</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCameraOpen(true)}><Camera className="mr-2 h-4 w-4" /><span>Camera</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Audio sending not implemented')}><Music className="mr-2 h-4 w-4" /><span>Audio</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Location sending not implemented')}><MapPin className="mr-2 h-4 w-4" /><span>Location</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Contact sharing not implemented')}><User className="mr-2 h-4 w-4" /><span>Contact</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Polls not implemented')}><Vote className="mr-2 h-4 w-4" /><span>Poll</span></DropdownMenuItem>
                <DropdownMenuItem onClick={() => showToast('Events not implemented')}><CalendarPlus className="mr-2 h-4 w-4" /><span>Event</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-background border-input focus-visible:ring-primary"
            autoComplete="off"
            disabled={!isConnected || !!imageToSend}
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={!isConnected || !newMessage.trim()}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </>
  );
}

    