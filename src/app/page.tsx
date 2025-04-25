import ContactList from '@/components/app/contact-list';
import ChatWindow from '@/components/app/chat-window';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex h-screen w-screen bg-secondary overflow-hidden">
      <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md border-r bg-background flex flex-col">
        <ContactList />
      </div>
       <Separator orientation="vertical" className="bg-border h-full" />
      <div className="flex-1 flex flex-col">
        <ChatWindow />
      </div>
    </div>
  );
}
