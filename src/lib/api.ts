
import type { Contact, Message } from '@/types';
import { initialContacts, getMockMessages as getMockMessagesData } from './mock-data';

// --- Configuration ---
// For development, your Django server might be running on http://127.0.0.1:8000
// For production, this would be your deployed backend URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * A wrapper for fetch that includes the base URL and can be
 * configured to include authentication tokens.
 * 
 * We will use this to make requests to the backend.
 * For now, it's just a placeholder and we return mock data.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Here you would add your JWT token to the headers
  const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${your_jwt_token}`,
    ...options.headers,
  };

  // For now, we are short-circuiting the fetch and returning mock data.
  // In the future, you would remove this and uncomment the fetch call.
  console.log(`API call (mocked): ${options.method || 'GET'} ${url}`);

  if (endpoint.startsWith('/messages')) {
    //
  }

  // To integrate, you would uncomment this block and remove the mock data returns.
  /*
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API fetch error:", error);
    throw error; // Re-throw so React Query can handle it
  }
  */
}


// --- API Functions ---

/**
 * Fetches the list of contacts for the current user.
 * GET /contacts/
 */
export async function getContacts(): Promise<Contact[]> {
  // MOCK IMPLEMENTATION
  // Simulates a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(initialContacts);
  
  // REAL IMPLEMENTATION
  // return await apiFetch('/contacts/');
}

/**
 * Fetches the message history for a specific contact.
 * GET /messages/{contactId}/
 */
export async function getMessages(contactId: string): Promise<Message[]> {
    // MOCK IMPLEMENTATION
    await new Promise(resolve => setTimeout(resolve, 300));
    return Promise.resolve(getMockMessagesData(contactId));

    // REAL IMPLEMENTATION
    // return await apiFetch(`/messages/${contactId}/`);
}

/**
 * Sends a new message.
 * POST /messages/
 */
export async function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
    // MOCK IMPLEMENTATION
    const newMessage: Message = {
        id: `m${Date.now()}`,
        timestamp: new Date(),
        status: 'sent',
        ...message
    };
    return Promise.resolve(newMessage);

    // REAL IMPLEMENTATION
    // return await apiFetch('/messages/', {
    //     method: 'POST',
    //     body: JSON.stringify(message),
    // });
}
