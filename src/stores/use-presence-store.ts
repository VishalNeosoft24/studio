
import create from 'zustand';
import type { PresenceState } from '@/types';

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},
  typingUsers: {},

  isOnline: (userId: number) => !!get().onlineUsers[userId],
  
  lastSeen: (userId: number) => {
    const user = get().onlineUsers[userId];
    return user ? user.last_seen : null;
  },

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
        if (newOnlineUsers[userId]) {
          delete newOnlineUsers[userId];
        }
      }
      return { onlineUsers: newOnlineUsers };
    });
  },
  
  setTyping: (chatId: string, userId: number, isTyping: boolean) => {
    set(state => {
      const newTypingUsers = { ...state.typingUsers };
      let typingInChat = newTypingUsers[chatId] ? [...newTypingUsers[chatId]] : [];
      const currentUserId = get().onlineUsers ? Object.keys(get().onlineUsers).map(Number).find(id => id !== userId) : undefined;

      if (isTyping) {
        if (!typingInChat.includes(userId) && userId !== currentUserId) {
          typingInChat.push(userId);
        }
      } else {
        typingInChat = typingInChat.filter(id => id !== userId);
      }

      if (typingInChat.length > 0) {
        newTypingUsers[chatId] = typingInChat;
      } else {
        delete newTypingUsers[chatId];
      }
      
      return { typingUsers: newTypingUsers };
    });
  },

}));
