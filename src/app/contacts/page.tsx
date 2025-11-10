
'use client';

import { useState } from 'react';
import type { Contact } from '@/types';
import ContactList from '@/components/app/contact-list';
import ChatPlaceholder from '@/components/app/chat-placeholder';
import { initialContacts } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function ContactsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [contacts] = useState<Contact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const handleSelectContact = (id: string) => {
    // In a real app, you would check if a chat with this contact
    // already exists. If so, navigate to that chat.
    // Otherwise, you might have an API to create a new chat.
    // For now, we'll just show a toast and navigate back to the main chat page.
    const contact = contacts.find(c => c.id === id);
    if(contact) {
        toast({
            title: "Starting new chat...",
            description: `This would open a chat with ${contact.name}. This feature is not fully implemented yet.`
        })
    }
    // Simulate navigating to a chat
    router.push('/chat');
  };

  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      {/* Left sidebar - Contact list */}
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        <ContactList
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={handleSelectContact}
        />
      </div>

      {/* Right section - Placeholder */}
      <div className="flex-1 flex flex-col">
        <ChatPlaceholder />
      </div>
    </div>
  );
}
