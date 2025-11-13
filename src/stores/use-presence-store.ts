
import create from 'zustand';
import { PresenceState } from '@/types';

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},
  typingUsers: {},

  isOnline: (userId: number) => !!get().onlineUsers[userId],
  lastSeen: (userId: number) => get().onlineUsers[userId]?.last_seen || null,

  isTyping: (chatId: string, userId: number) => {
    const typingInChat = get().typingUsers[chatId] || [];
    return typingInChat.includes(userId);
  },

  setPresence: (userId: number, isOnline: boolean, lastSeen: string | null) => {
    set(state => {
      const newOnlineUsers = { ...state.onlineUsers };
      if (isOnline) {
        newOnlineUsers[userId] = { last_seen: null };
      } else {
        // Only update last_seen if user is going offline
        if (newOnlineUsers[userId]) {
            newOnlineUsers[userId].last_seen = lastSeen;
        }
        delete newOnlineUsers[userId];
      }
      return { onlineUsers: newOnlineUsers };
    });
  },
  
  setTyping: (chatId: string, userId: number, isTyping: boolean) => {
    set(state => {
      const newTypingUsers = { ...state.typingUsers };
      let typingInChat = newTypingUsers[chatId] ? [...newTypingUsers[chatId]] : [];

      if (isTyping) {
        // Add user if not already in the list
        if (!typingInChat.includes(userId)) {
          typingInChat.push(userId);
        }
      } else {
        // Remove user from the list
        typingInChat = typingInChat.filter(id => id !== userId);
      }

      if (typingInChat.length > 0) {
        newTypingUsers[chatId] = typingInChat;
      } else {
        delete newTypingUsers[chatId]; // Clean up if no one is typing
      }
      
      return { typingUsers: newTypingUsers };
    });
  },

}));
