import { MessageSquareText } from 'lucide-react';

export default function ChatPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-secondary text-center p-4">
      <div className="border-4 border-muted-foreground/20 rounded-full p-8">
        <MessageSquareText className="h-24 w-24 text-muted-foreground/50" />
      </div>
      <h2 className="mt-6 text-3xl font-light text-foreground/80">Chatterbox Web</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Select a chat to start messaging or create a new one. All your conversations are secure and private.
      </p>
      <div className="mt-4 border-t border-border w-full max-w-sm"></div>
    </div>
  );
}
