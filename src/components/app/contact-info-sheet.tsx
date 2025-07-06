'use client';

import type { Contact } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { BellOff, Ban, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactInfoSheetProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContactInfoSheet({ contact, open, onOpenChange }: ContactInfoSheetProps) {
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
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-4">{contact.name}</h2>
            <p className="text-muted-foreground">{contact.status === 'online' ? 'Online' : contact.status}</p>
            </div>
            <Separator />
            <div className="px-6 py-4 space-y-4">
            <div>
                <h3 className="text-sm font-medium text-primary">About</h3>
                <p className="text-sm mt-1">{contact.about || 'No "about" information.'}</p>
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
                    <span>Block {contact.name}</span>
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
