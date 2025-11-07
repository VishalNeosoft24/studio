

export type User = {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    about?: string;
}

export type Participant = {
    id: number;
    username: string;
    profile_picture_url: string | null;
}

export type Chat = {
    id: string;
    name: string;
    chat_type: 'private' | 'group';
    participants: Participant[];
    created_at: string;
}

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
