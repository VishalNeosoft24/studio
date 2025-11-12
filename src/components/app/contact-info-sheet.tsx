
'use client';

import type { Participant, UpdateContactPayload } from '@/types';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { BellOff, Ban, X, Copy, Pencil, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateContact } from '@/lib/api';

interface ContactInfoSheetProps {
  participant: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactInfoSheet({ participant, open, onOpenChange }: ContactInfoSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  useEffect(() => {
    if (participant) {
      setDisplayName(participant.display_name || participant.username);
    }
  }, [participant]);

  const contactUpdateMutation = useMutation({
    mutationFn: (payload: { contactId: number; data: UpdateContactPayload }) => updateContact(payload.contactId, payload.data),
    onSuccess: () => {
      toast({ title: 'Contact Updated', description: 'The contact name has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] }); // Invalidate chats to update display names
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      setDisplayName(participant.display_name || participant.username); // Revert on error
    },
    onSettled: () => {
      setIsEditingName(false);
    }
  });

  const handleNameUpdate = () => {
    if (!displayName.trim()) {
      toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name cannot be empty.' });
      setDisplayName(participant.display_name || participant.username);
      setIsEditingName(false);
      return;
    }
    if (displayName !== (participant.display_name || participant.username)) {
      contactUpdateMutation.mutate({ contactId: participant.id, data: { name: displayName } });
    } else {
      setIsEditingName(false);
    }
  };


  if (!participant) return null;
    
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const handleClose = () => {
    setIsEditingName(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[30%] sm:w-[30%] p-0 flex flex-col" onInteractOutside={handleClose}>
        <SheetHeader className="bg-secondary p-4 flex-row items-center gap-4 justify-between">
            <div className='flex items-center gap-4'>
                 <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                        <X className="h-5 w-5"/>
                    </Button>
                </SheetClose>
                <SheetTitle className="truncate">Contact info</SheetTitle>
            </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center p-6 bg-background">
            <Avatar className="h-40 w-40">
                <AvatarImage src={participant.profile_picture_url ?? undefined} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-4 w-full max-w-xs">
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-9 text-xl text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameUpdate();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                />
                 <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600" onClick={handleNameUpdate} disabled={contactUpdateMutation.isPending}>
                    {contactUpdateMutation.isPending ? <Loader2 className='animate-spin'/> : <Check className="h-5 w-5" />}
                </Button>
              </div>
            ) : (
               <div className="flex items-center gap-2 mt-4">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-8 w-8">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
              </div>
            )}
            <p className="text-muted-foreground">Online</p>
            </div>
            <Separator />
            <div className="px-6 py-4 space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-primary">About</h3>
                    <p className="text-sm mt-1">{'Hey there! I am using Chatterbox.'}</p>
                </div>
                <Separator />
                 <div>
                    <h3 className="text-sm font-medium text-primary">Phone</h3>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-sm">{participant.phone_number}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(participant.phone_number)}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy phone number</span>
                        </Button>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="p-4 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground p-3">
                    <BellOff className="h-5 w-5 mr-4" />
                    <span>Mute notifications</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive p-3">
                    <Ban className="h-5 w-5 mr-4" />
                    <span>Block {displayName}</span>
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
