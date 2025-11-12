
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SendHorizonal, Paperclip, Smile, FileText, ImageIcon as ImageIconLucide, Camera, User, Vote, Music, MapPin, CalendarPlus, X } from 'lucide-react';
import Picker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useToast } from '@/hooks/use-toast';
import CameraViewDialog from './camera-view-dialog';

interface MessageInputProps {
  onSendMessage: (message: string) => boolean;
  onSendImage: (image: string, caption: string) => boolean;
  isConnected: boolean;
}

export default function MessageInput({ onSendMessage, onSendImage, isConnected }: MessageInputProps) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [imageToSend, setImageToSend] = useState<string | null>(null);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (title: string, description?: string) => {
    toast({ title, description: description || 'This feature is not yet implemented.' });
  };
  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    
    if (imageToSend) {
        // Sending an image with caption
        const success = onSendImage(imageToSend, text);
        if (success) {
            setImageToSend(null);
            setText('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to send image',
                description: 'Could not connect to the server.',
            });
        }
    } else if (text.trim() !== '') {
        // Sending a text message
        const success = onSendMessage(text);
        if (success) {
            setText('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Failed to send message',
                description: 'Could not connect to the server.',
            });
        }
    }
  };

  const handleEmojiSelect = (emoji: EmojiClickData) => {
    setText(prevInput => prevInput + emoji.emoji);
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image smaller than 5MB.' });
              return;
          }
          const base64 = await fileToBase64(file);
          setImageToSend(base64);
      }
      // Reset file input to allow selecting the same file again
      if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCapture = (dataUrl: string) => {
      setImageToSend(dataUrl);
  };

  return (
    <>
      <CameraViewDialog open={isCameraOpen} onOpenChange={setCameraOpen} onCapture={handleCapture} />
      <div className="p-3 border-t bg-secondary flex flex-col">
        {/* Image Preview */}
        {imageToSend && (
            <div className="relative p-2 mb-2 bg-background rounded-md h-40">
                <Image src={imageToSend} layout="fill" objectFit="contain" alt="Image preview" />
                <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setImageToSend(null)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                </Button>
            </div>
        )}
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          {!imageToSend && (
            <>
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
            </>
          )}

          <Input
            type="text"
            placeholder={imageToSend ? 'Add a caption...' : 'Type a message'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-background border-input focus-visible:ring-primary"
            autoComplete="off"
            disabled={!isConnected}
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90" disabled={!isConnected || (!text.trim() && !imageToSend)}>
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </>
  );
}
