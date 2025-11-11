

// For the UI, simplified
export type User = {
    id: string;
    username: string;
    avatarUrl?: string;
    about?: string;
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
    profile_picture_url: string | null;
}

export type Chat = {
    id: string;
    name: string;
    chat_type: 'private' | 'group';
    participants: Participant[];
    created_at: string;
}

export type CreateChatPayload = {
    name: string;
    chat_type: 'private' | 'group';
    participant_ids: number[];
}

// Represents the raw message from your DRF API (via WebSocket or REST)
export type ApiMessage = {
    id: number;
    sender: Participant; // This might be nested in your WS response
    sender_id: number;
    sender_username: string;
    content: string;
    message: string; // Your WS consumer seems to use 'message' for content
    message_type: 'text' | 'image' | 'file'; // As defined by your backend
    timestamp: string; // ISO 8601 date string
    created_at: string; // Your WS consumer uses this
};


// Represents a message transformed for the UI
export type Message = {
  id: string;
  sender: 'me' | 'contact'; // Simplified for UI purposes
  type: 'text' | 'image';
  text: string;
  imageUrl?: string;
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
    