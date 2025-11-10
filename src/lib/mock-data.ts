import type { Message } from '@/types';

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
    { id: 'm5', sender: 'me', type: 'text', text: 'Following up on our chat. I\'ve pushed the initial code to the repo.', timestamp: getPastDate(1, 14, 15), status: 'read' },
    { id: 'm6', sender: 'contact', type: 'text', text: 'Perfect timing! I just got free as well. Let me call you in 5.', timestamp: getPastDate(1, 14, 20) },

    // Conversation from today
    { id: 'm7', sender: 'me', type: 'text', text: 'Great chat yesterday! I\'ve pushed the initial code to the repo.', timestamp: getPastDate(0, 9, 1), status: 'delivered' },
    { id: 'm8', sender: 'contact', type: 'text', text: 'Awesome, I\'ll take a look now. Thanks!', timestamp: getPastDate(0, 9, 5) },
  ];

  // Simple logic to vary messages based on contact ID, to make chats look different
  const messageCount = 2 + (parseInt(contactId, 10) % (allMessages.length - 1));
  return allMessages.slice(0, messageCount);
};
