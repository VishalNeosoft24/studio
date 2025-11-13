







// For the UI, simplified
export type User = {
    id: string | number;
    username: string;
    display_name?: string | null;
    email?: string;
    phone_number?: string | null;
    profile_picture_url?: string | null;
    about_status?: string | null;
    avatarUrl?: string | null; 
    about?: string; // a bit redundant
    is_online: boolean;
    last_seen: string | null;
}

export type UpdateProfilePayload = {
    display_name?: string;
    about_status?: string;
}

export type RegisterPayload = {
    username: string;
    email: string;
    phone_number: string;
    password: string;
    password2: string;
}

export type Participant = {
    id: number;
    username: string;
    phone_number: string;
    profile_picture_url: string | null;
    display_name?: string | null;
    is_online: boolean;
    last_seen: string | null;
}

export type Chat = {
    id: string;
    name: string;
    chat_type: 'private' | 'group';
    participants: Participant[];
    chat_display_name: string;
    created_at: string;
}

export type CreateChatPayload = {
    name: string;
    chat_type: 'private' | 'group';
    participant_ids: number[];
}

export type AddContactPayload = {
    name: string;
    phone_number: string;
};

export type UpdateContactPayload = {
    name?: string;
};


// Represents the raw message from your DRF API (via WebSocket or REST)
export type ApiMessage = {
    id: number;
    chatId: string;
    sender: Participant; // This might be nested in your WS response
    sender_id: number;
    sender_username: string;
    content: string;
    message: string; // Your WS consumer seems to use 'message' for content
    message_type: 'text' | 'image' | 'file'; // As defined by your backend
    timestamp: string; // ISO 8601 date string
    created_at: string; // Your WS consumer uses this
    image?: string | null; // URL for the image
};


// Represents a message transformed for the UI
export type Message = {
  id: string;
  chatId: string;
  sender: 'me' | 'contact'; // Simplified for UI purposes
  type: 'text' | 'image';
  text: string;
  imageUrl?: string | null;
  timestamp: Date; // Date object for easier formatting
  status?: 'sent' | 'delivered' | 'read'; // Optional status for outbound messages
};


// Represents the raw contact data from your API
export type ApiContact = {
    id: number;
    contact: {
        id: number;
        username: string;
        profile_picture_url: string | null;
        about_status: string | null;
        display_name?: string | null;
    } | null; // Can be null if not registered
    phone_number: string;
    name: string; // Name from phone contacts
    is_registered: boolean;
    is_blocked: boolean;
    is_muted: boolean;
    created_at: string;
};

// Represents a contact transformed for the UI
export type Contact = {
    id: string; // The contact's user ID (if registered) or a temporary ID
    name: string;
    avatarUrl: string | null;
    isMuted: boolean;
    about: string | null;
    isRegistered: boolean;
};

export type PresenceState = {
    onlineUsers: Record<number, { last_seen: string | null }>;
    typingUsers: Record<string, number[]>; // { chatId: [userId1, userId2] }
    
    isOnline: (userId: number) => boolean;
    lastSeen: (userId: number) => string | null;
    isTyping: (chatId: string, userId: number) => boolean;

    setPresence: (userId: number, isOnline: boolean, lastSeen: string | null) => void;
    setTyping: (chatId: string, userId: number, isTyping: boolean) => void;
};
    
