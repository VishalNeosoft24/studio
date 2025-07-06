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
  const baseMessages: Message[] = [
    { id: 'm1', sender: 'contact', type: 'text', text: 'Hey, how are you?', timestamp: '10:28 AM' },
    { id: 'm2', sender: 'me', type: 'text', text: 'Hi! I\'m good, thanks. How about you?', timestamp: '10:29 AM', status: 'read' },
    { id: 'm3', sender: 'contact', type: 'text', text: 'Doing well! Just working on that report.', timestamp: '10:29 AM' },
    { id: 'm4', sender: 'me', type: 'text', text: 'Ah, same here. Almost done?', timestamp: '10:30 AM', status: 'delivered' },
    { id: 'm5', sender: 'contact', type: 'text', text: 'Yeah, pretty much. Need a break soon 😅', timestamp: '10:30 AM' },
    { id: 'm6', sender: 'me', type: 'text', text: 'Tell me about it! Coffee later?', timestamp: '10:31 AM', status: 'sent' },
  ];
  // Simple logic to vary messages based on contact ID
  const messageCount = 2 + (parseInt(contactId, 10) % 5);
  const userMessages = [
      "Great!", 
      "How's your day going?", 
      "What are you up to?", 
      "Sounds good, let's connect later.",
      "Can you resend that file?"
  ];
  const contactMessages = [
      "Not much, just chilling.",
      "Working on a new project.",
      "I'm good, thanks for asking!",
      "Sure, I'll send it right over.",
      "Let's catch up tomorrow."
  ];

  const specificMessages: Message[] = [];
  for(let i=0; i<messageCount; i++) {
      specificMessages.push({
          id: `m${i+1}`,
          sender: i % 2 === 0 ? 'contact' : 'me',
          type: 'text',
          text: i % 2 === 0 ? contactMessages[i % contactMessages.length] : userMessages[i % userMessages.length],
          timestamp: `11:0${i} AM`,
          status: i % 2 !== 0 ? 'read' : undefined
      });
  }

  return specificMessages;
};
