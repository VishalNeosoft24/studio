export type Contact = {
  id: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string; // Consider using Date object or a library like date-fns for real apps
  online: boolean;
};

export type Message = {
  id: string;
  sender: 'me' | 'contact'; // Simplified for UI purposes
  text: string;
  timestamp: string; // Consider using Date object
  status?: 'sent' | 'delivered' | 'read'; // Optional status for outbound messages
};
