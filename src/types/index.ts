

// For the UI, simplified
export type User = {
    id: string;
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

// Represents the raw message from your DRF API
export type ApiMessage = {
    id: number;
    sender: Participant;
    content: string;
    message_type: 'text' | 'image' | 'file'; // As defined by your backend
    timestamp: string; // ISO 8601 date string
};


// Represents a message transformed for the UI
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
  timestamp: Date; // Date object for easier formatting
  status?: 'sent' | 'delivered' | 'read'; // Optional status for outbound messages
};
