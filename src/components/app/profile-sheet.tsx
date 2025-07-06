'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Pencil } from 'lucide-react';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const [name, setName] = useState('Your Name');
  const [about, setAbout] = useState('Hey there! I am using Chatterbox.');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[30%] sm:w-[30%] p-0">
        <SheetHeader className="bg-secondary p-4 flex-row items-center gap-4">
          <SheetTitle>Profile</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center p-6 bg-background">
           <div className="relative group cursor-pointer">
            <Avatar className="h-40 w-40">
                <AvatarImage src="https://picsum.photos/id/42/200/200" alt="My Avatar" data-ai-hint="profile person" />
                <AvatarFallback>YOU</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-8 w-8 text-white" />
                <span className="text-white text-center text-xs mt-1">CHANGE<br/>PROFILE PHOTO</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
            <div>
                <Label className="text-primary">Your name</Label>
                <div className="flex items-center gap-4 mt-2">
                {isEditingName ? (
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        onBlur={() => setIsEditingName(false)}
                        autoFocus
                    />
                ) : (
                    <p className="flex-1">{name}</p>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(!isEditingName)}>
                    <Pencil className="h-5 w-5 text-muted-foreground" />
                </Button>
                </div>
            </div>
            <Separator />
             <div>
                <Label className="text-primary">About</Label>
                 <div className="flex items-center gap-4 mt-2">
                    {isEditingAbout ? (
                        <Input 
                            value={about} 
                            onChange={(e) => setAbout(e.target.value)}
                            onBlur={() => setIsEditingAbout(false)}
                            autoFocus
                        />
                    ) : (
                        <p className="flex-1 text-sm">{about}</p>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingAbout(!isEditingAbout)}>
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
