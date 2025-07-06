import type { Contact, Message } from '@/types';

export const initialContacts: Contact[] = [
  { id: '1', name: 'Alice', avatarUrl: 'https://picsum.photos/id/101/50/50', lastMessage: 'Hey, how are you?', lastMessageTimestamp: '10:30 AM', status: 'online', unreadCount: 2, about: 'Designer & Dreamer ✨' },
  { id: '2', name: 'Bob', avatarUrl: 'https://picsum.photos/id/102/50/50', lastMessage: 'See you later!', lastMessageTimestamp: '9:15 AM', status: 'last seen 2 hours ago', about: 'Coffee enthusiast ☕️' },
  { id: '3', name: 'Charlie', avatarUrl: 'https://picsum.photos/id/103/50/50', lastMessage: 'Okay, sounds good.', lastMessageTimestamp: 'Yesterday', status: 'online', unreadCount: 5, about: 'Developer' },
  { id: '4', name: 'David', avatarUrl: 'https://picsum.photos/id/104/50/50', lastMessage: 'Let me check that.', lastMessageTimestamp: 'Yesterday', status: 'last seen yesterday at 8:40 PM', about: 'Currently traveling the world 🌍' },
  { id: '5', name: 'Eve', avatarUrl: 'https://picsum.photos/id/105/50/50', lastMessage: 'Thanks!', lastMessageTimestamp: 'Mon', status: 'last seen on Monday', about: 'Available for work' },
  { id: '6', name: 'Frank', avatarUrl: 'https://picsum.photos/id/106/50/50', lastMessage: 'Can you send the file?', lastMessageTimestamp: 'Mon', status: 'online', about: 'At the gym' },
  { id: '7', name: 'Grace', avatarUrl: 'https://picsum.photos/id/107/50/50', lastMessage: '👍', lastMessageTimestamp: 'Sun', status: 'last seen recently', unreadCount: 1, about: 'Sleeping...' },
  { id: '8', name: 'Heidi', avatarUrl: 'https://picsum.photos/id/108/50/50', lastMessage: 'I will call you back.', lastMessageTimestamp: 'Sun', status: 'last seen a week ago', about: 'Hey there! I am using Chatterbox.' },
];

// Mock message history for different contacts
export const getMockMessages = (contactId: string): Message[] => {
  const now = new Date();

  const getPastDate = (days: number, hours: number, minutes: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const allMessages: Message[] = [
    // Conversation from 2 days ago
    { id: 'm1', sender: 'contact', type: 'text', text: 'Hey! Are we still on for the project discussion today?', timestamp: getPastDate(2, 10, 30) },
    { id: 'm2', sender: 'me', type: 'text', text: 'Yes, absolutely! I\'m just wrapping up a few things. Give me an hour?', timestamp: getPastDate(2, 10, 31), status: 'read' },
    { id: 'm3', sender: 'contact', type: 'text', text: 'Sure, sounds good. Ping me when you\'re ready.', timestamp: getPastDate(2, 10, 32) },
    { id: 'm4', sender: 'me', type: 'image', text: 'Here is the draft I mentioned.', imageUrl: 'https://placehold.co/400x300.png', timestamp: getPastDate(2, 15, 5), status: 'read' },

    // Conversation from yesterday
    { id: 'm5', sender: 'me', type: 'text', text: 'Following up on our chat. I\'m free now if you are.', timestamp: getPastDate(1, 14, 15), status: 'read' },
    { id: 'm6', sender: 'contact', type: 'text', text: 'Perfect timing! I just got free as well. Let me call you in 5.', timestamp: getPastDate(1, 14, 20) },

    // Conversation from today
    { id: 'm7', sender: 'me', type: 'text', text: 'Great chat yesterday! I\'ve pushed the initial code to the repo.', timestamp: getPastDate(0, 9, 1), status: 'delivered' },
    { id: 'm8', sender: 'contact', type: 'text', text: 'Awesome, I\'ll take a look now. Thanks!', timestamp: getPastDate(0, 9, 5) },
  ];

  // Simple logic to vary messages based on contact ID, to make chats look different
  const messageCount = 2 + (parseInt(contactId, 10) % (allMessages.length - 1));
  return allMessages.slice(0, messageCount);
};
