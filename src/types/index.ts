export type Contact = {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  status: 'online' | string; // Can be 'online' or a 'last seen at...' string
  unreadCount?: number;
  isMuted?: boolean;
  isBlocked?: boolean;
  about?: string;
};

export type Message = {
  id: string;
  sender: 'me' | 'contact'; // Simplified for UI purposes
  type: 'text' | 'image' | 'document' | 'contact' | 'poll' | 'audio' | 'location' | 'event';
  text: string;
  imageUrl?: string;
  document?: { name: string; size: string };
  contactInfo?: { name: string; avatarUrl: string };
  poll?: { question: string; options: string[] };
  audio?: { name: string, duration: string };
  location?: { address: string };
  event?: { title: string, dateTime: Date };
  timestamp: Date; // Consider using Date object
  status?: 'sent' | 'delivered' | 'read'; // Optional status for outbound messages
};
