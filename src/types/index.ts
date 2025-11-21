

// For the UI, simplified
export type User = {
    id: string | number;
    username: string;
    display_name?: string | null;
    email?: string;
    phone_number?: string | null;
    profile_picture_url?: string | null;
    avatarUrl?: string | null; 
    about?: string; // a bit redundant
    about_status?: string | null;
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
    last_message:string
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


// Represents the raw message from your DRF REST API (for old messages)
// This is now a more flexible type to handle both REST and WS data before transformation.
export type ApiMessage = {
    id: number | string; // Can be string for temp_id
    sender?: Participant; // Present in REST API
    sender_id?: number; // Present in WS and for optimistic messages
    content?: string; // Present in REST API
    message?: string; // Present in WS
    message_type: 'text' | 'image' | 'file';
    created_at: string;
    image?: string | null;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    temp_id?: string; // For optimistic updates
};

export interface ChatMessage {
  id: number | string;
  content: string;
  sender: number;
  created_at?: string;
  temp_id?: number | string;
  status?: 'sent' | 'delivered' | 'read' | 'sending';
  pending?: boolean;
}


// Represents a contact transformed for the UI
export type Contact = {
    id: string; // The contact's user ID (if registered) or a temporary ID
    name: string;
    avatarUrl: string | null;
    isMuted: boolean;
    about: string | null;
    isRegistered: boolean;
};


// For Presence
export type OnlineUser = {
  last_seen: string | null;
};

export type PresenceState = {
  onlineUsers: { [userId: number]: OnlineUser };
  typingUsers: { [chatId: string]: number[] };
  isOnline: (userId: number) => boolean;
  lastSeen: (userId: number) => string | null;
  isTyping: (chatId: string, userId: number) => boolean;
  setPresence: (userId: number, isOnline: boolean, lastSeen: string | null) => void;
  setTyping: (chatId: string, userId: number, isTyping: boolean) => void;
};
