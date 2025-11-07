import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ChatListProps = {
  chats: any[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
};

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={cn(
            "flex items-center space-x-4 p-3 cursor-pointer hover:bg-accent transition",
            chat.id === selectedChatId && "bg-accent"
          )}
        >
          <Avatar>
            <AvatarImage
              src={chat.participants?.[1]?.profile_picture_url || ""}
            />
            <AvatarFallback>{chat.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{chat.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {chat.chat_type}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
