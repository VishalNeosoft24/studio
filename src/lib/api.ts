
// import type { Contact, Message } from '@/types';
// import { initialContacts, getMockMessages as getMockMessagesData } from './mock-data';

// // --- Configuration ---
// // For development, your Django server might be running on http://127.0.0.1:8000
// // For production, this would be your deployed backend URL.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// /**
//  * A wrapper for fetch that includes the base URL and can be
//  * configured to include authentication tokens.
//  * 
//  * We will use this to make requests to the backend.
//  * For now, it's just a placeholder and we return mock data.
//  */
// async function apiFetch(endpoint: string, options: RequestInit = {}) {
//   const url = `${API_BASE_URL}${endpoint}`;
  
//   // Here you would add your JWT token to the headers
//   const headers = {
//     'Content-Type': 'application/json',
//     // 'Authorization': `Bearer ${your_jwt_token}`,
//     ...options.headers,
//   };

//   // For now, we are short-circuiting the fetch and returning mock data.
//   // In the future, you would remove this and uncomment the fetch call.
//   console.log(`API call (mocked): ${options.method || 'GET'} ${url}`);

//   if (endpoint.startsWith('/messages')) {
//     //
//   }

//   // To integrate, you would uncomment this block and remove the mock data returns.
//   /*
//   try {
//     const response = await fetch(url, { ...options, headers });
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("API fetch error:", error);
//     throw error; // Re-throw so React Query can handle it
//   }
//   */
// }


// // --- API Functions ---

// /**
//  * Fetches the list of contacts for the current user.
//  * GET /contacts/
//  */
// export async function getContacts(): Promise<Contact[]> {
//   // MOCK IMPLEMENTATION
//   // Simulates a network delay
//   await new Promise(resolve => setTimeout(resolve, 500));
//   return Promise.resolve(initialContacts);
  
//   // REAL IMPLEMENTATION
//   // return await apiFetch('/contacts/');
// }

// /**
//  * Fetches the message history for a specific contact.
//  * GET /messages/{contactId}/
//  */
// export async function getMessages(contactId: string): Promise<Message[]> {
//     // MOCK IMPLEMENTATION
//     await new Promise(resolve => setTimeout(resolve, 300));
//     return Promise.resolve(getMockMessagesData(contactId));

//     // REAL IMPLEMENTATION
//     // return await apiFetch(`/messages/${contactId}/`);
// }

// /**
//  * Sends a new message.
//  * POST /messages/
//  */
// export async function sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'>): Promise<Message> {
//     // MOCK IMPLEMENTATION
//     const newMessage: Message = {
//         id: `m${Date.now()}`,
//         timestamp: new Date(),
//         status: 'sent',
//         ...message
//     };
//     return Promise.resolve(newMessage);

//     // REAL IMPLEMENTATION
//     // return await apiFetch('/messages/', {
//     //     method: 'POST',
//     //     body: JSON.stringify(message),
//     // });
// }


/**
 * Logs in a user.
 * POST /auth/token/
 */
// export async function login(username: string, password: string): Promise<User> {
//     console.log('Attempting to log in with:', { username, password });
//     // MOCK IMPLEMENTATION
//     await new Promise(resolve => setTimeout(resolve, 500));
//     const user = mockUsers.find(u => u.username === username);
//     if (user) {
//         // In a real app, you'd check the password hash here
//         console.log('Login successful for user:', user);
//         return Promise.resolve(user);
//     } else {
//         console.log('Login failed: user not found');
//         return Promise.reject(new Error('Invalid credentials'));
//     }

//     // REAL IMPLEMENTATION
//     // const response = await apiFetch('/auth/token/', {
//     //     method: 'POST',
//     //     body: JSON.stringify({ username, password }),
//     // });
//     // return response as User; 
// }

/**
 * Registers a new user.
 * POST /auth/register/
 */
// export async function register(username: string, password: string): Promise<User> {
//     // MOCK IMPLEMENTATION
//     await new Promise(resolve => setTimeout(resolve, 500));
//     if (mockUsers.some(u => u.username === username)) {
//         return Promise.reject(new Error('Username already in use'));
//     }
//     const newUser: User = {
//         id: `u${mockUsers.length + 1}`,
//         name: username, // Using username as the name for now
//         username: username,
//     };
//     mockUsers.push(newUser);
//     return Promise.resolve(newUser);
    
//     // REAL IMPLEMENTATION
//     // const response = await apiFetch('/auth/register/', {
//     //     method: 'POST',
//     //     body: JSON.stringify({ username, password }),
//     // });
//     // return response as User;
// }

/**
 * Fetches the list of contacts for the current user.
 * GET /contacts/
 */
// export async function getContacts(): Promise<Contact[]> {
//   return await apiFetch('/contacts/');
// }

import type { Contact, Message, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// 🔑 Get JWT token from localStorage
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// 🌐 Common fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error (${response.status}): ${errorData}`);
  }

  // Try to parse JSON safely
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
}


export async function getContacts() {
  const data = await apiFetch("/contacts/");

  return data.map((item: any) => ({
    id: item.id,
    name: item.contact?.username || 'Unknown',
    avatarUrl: item.contact?.profile_picture_url || '',
    about: item.contact?.about_status || '',
    isBlocked: item.is_blocked,
    isMuted: item.is_muted,
  }));
}


export async function getChats() {
  const data = await apiFetch("/chats/");

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    chatType: item.chat_type,
    participants: item.participants,
    createdAt: item.created_at,
  }));
}



/**
 * 💬 Fetch messages for a chat
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  return await apiFetch(`/chats/${chatId}/messages/`);
}

/**
 * ✉️ Send new message to a chat
 */
export async function sendMessage(
  chatId: string,
  message: Omit<Message, 'id' | 'timestamp' | 'status'>
): Promise<Message> {
  return await apiFetch(`/chats/${chatId}/messages/`, {
    method: 'POST',
    body: JSON.stringify(message),
  });
}



export async function login(username: string, password: string) {
console.log('Attempting login for:', username);

const response = await apiFetch('/auth/token/', {
method: 'POST',
body: JSON.stringify({ username, password }),
});

// Expecting JWT response from DRF SimpleJWT
if (response.access && response.refresh) {
localStorage.setItem('access_token', response.access);
localStorage.setItem('refresh_token', response.refresh);
console.log('Login successful, tokens saved.');
return response; // ✅ Return tokens so frontend knows login succeeded
}

throw new Error('Invalid login response (missing tokens)');
}

/** 🆕 Register a new user */
export async function register(username: string, password: string): Promise<User> {
console.log('Registering user:', username);

const data = await apiFetch('/auth/register/', {
method: 'POST',
body: JSON.stringify({ username, password }),
});

if (data && data.username) {
console.log('Registration successful, auto logging in...');
return await login(username, password);
}

throw new Error('Registration failed (unexpected response)');
}