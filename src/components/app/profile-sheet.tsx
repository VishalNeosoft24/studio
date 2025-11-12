
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Camera, Pencil, Check, Loader2 } from 'lucide-react';
import { getProfile, updateProfile, uploadProfilePicture } from '@/lib/api';
import type { User, UpdateProfilePayload } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileSkeleton = () => (
    <div className='h-full'>
        <div className="bg-secondary p-4 flex-row items-center gap-4">
            <SheetTitle>Profile</SheetTitle>
        </div>
        <div className="flex flex-col items-center p-6 bg-background">
            <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="px-6 py-4 space-y-6">
            <div>
                <Label className="text-primary">Your name</Label>
                <Skeleton className="h-8 w-full mt-2" />
            </div>
            <Separator />
            <div>
                <Label className="text-primary">About</Label>
                <Skeleton className="h-8 w-full mt-2" />
            </div>
        </div>
    </div>
);

export default function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: open,
  });

  const [displayName, setDisplayName] = useState('');
  const [about, setAbout] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.username);
      setAbout(user.about_status || 'Hey there! I am using Chatterbox.');
    }
  }, [user]);

  const textUpdateMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
      toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
  
  const pictureUploadMutation = useMutation({
    mutationFn: (file: File) => uploadProfilePicture(file),
    onSuccess: (data) => {
        queryClient.setQueryData(['profile'], (oldData: User | undefined) => {
            if (!oldData) return undefined;
            return { ...oldData, profile_picture_url: data.profile_picture_url };
        });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        toast({ title: 'Profile Picture Updated' });
    },
    onError: (error) => {
        toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    }
  });

  const handleUpdateText = (field: 'display_name' | 'about_status', value: string) => {
    if (field === 'display_name' && value.trim() === '') {
        toast({ variant: 'destructive', title: 'Invalid Name', description: 'Name cannot be empty.'});
        setDisplayName(user?.display_name || user?.username || '');
        return;
    }
    textUpdateMutation.mutate({ [field]: value });
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: 'Image too large', description: 'Please select an image smaller than 5MB.' });
            return;
        }
        pictureUploadMutation.mutate(file);
    }
  };

  const getAvatarFallback = (name?: string) => {
      if (!name) return 'U';
      const parts = name.split(' ');
      if (parts.length > 1 && parts[1]) {
          return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[30%] sm:w-[30%] p-0">
        {isLoadingUser || !user ? (
            <ProfileSkeleton />
        ) : (
        <>
            <SheetHeader className="bg-secondary p-4 flex-row items-center gap-4">
            <SheetTitle>Profile</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center p-6 bg-background">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                />
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-40 w-40">
                        <AvatarImage src={user?.profile_picture_url || ''} alt={user?.username} />
                        <AvatarFallback>{getAvatarFallback(displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        {pictureUploadMutation.isPending ? (
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        ) : (
                            <>
                                <Camera className="h-8 w-8 text-white" />
                                <span className="text-white text-center text-xs mt-1">CHANGE<br />PROFILE PHOTO</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 space-y-6">
            <div>
                <Label className="text-primary">Your name</Label>
                <div className="flex items-center gap-2 mt-2">
                {isEditingName ? (
                    <>
                    <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-9"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUpdateText('display_name', displayName);
                                setIsEditingName(false);
                            }
                            if (e.key === 'Escape') setIsEditingName(false);
                        }}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600" onClick={() => { handleUpdateText('display_name', displayName); setIsEditingName(false); }}>
                        <Check className="h-5 w-5" />
                    </Button>
                    </>
                ) : (
                    <>
                    <p className="flex-1 py-1.5">{displayName}</p>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    </>
                )}
                </div>
            </div>
            <Separator />
            <div>
                <Label className="text-primary">About</Label>
                <div className="flex items-center gap-2 mt-2">
                {isEditingAbout ? (
                     <>
                    <Input
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className="h-9"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUpdateText('about_status', about);
                                setIsEditingAbout(false);
                            }
                            if (e.key === 'Escape') setIsEditingAbout(false);
                        }}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-green-600" onClick={() => { handleUpdateText('about_status', about); setIsEditingAbout(false); }}>
                        <Check className="h-5 w-5" />
                    </Button>
                    </>
                ) : (
                    <>
                    <p className="flex-1 text-sm py-1.5">{about}</p>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingAbout(true)}>
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    </>
                )}
                </div>
            </div>
            </div>
        </>
        )}
      </SheetContent>
    </Sheet>
  );
}
