
'use client';

import type { Participant } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BellOff, Ban, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInfoSheetProps {
  participant: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactInfoSheet({ participant, open, onOpenChange }: ContactInfoSheetProps) {
  if (!participant) return null;
    
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[30%] sm:w-[30%] p-0 flex flex-col">
        <SheetHeader className="bg-secondary p-4 flex-row items-center gap-4 justify-between">
            <div className='flex items-center gap-4'>
                 <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-5 w-5"/>
                    </Button>
                </SheetClose>
                <SheetTitle className="truncate">Contact info</SheetTitle>
            </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center p-6 bg-background">
            <Avatar className="h-40 w-40">
                <AvatarImage src={participant.profile_picture_url || ''} alt={participant.username} />
                <AvatarFallback>{participant.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-4">{participant.username}</h2>
            <p className="text-muted-foreground">Online</p>
            </div>
            <Separator />
            <div className="px-6 py-4 space-y-4">
            <div>
                <h3 className="text-sm font-medium text-primary">About</h3>
                <p className="text-sm mt-1">{'Hey there! I am using Chatterbox.'}</p>
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
                    <span>Block {participant.username}</span>
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
