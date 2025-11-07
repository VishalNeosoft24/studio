
import type { Message, User, Chat } from '@/types';

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
    // Special handling for 401 Unauthorized to redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
       console.error("Unauthorized request, redirecting to login.");
       localStorage.removeItem('access_token');
       localStorage.removeItem('refresh_token');
       window.location.href = '/login';
    }
    throw new Error(`API Error (${response.status}): ${errorData}`);
  }

  // Try to parse JSON safely, return text for empty responses
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


export async function getChats(): Promise<Chat[]> {
  const data = await apiFetch("/chats/");
  return data;
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
// After successful registration, log the user in to get tokens
const tokens = await login(username, password);
// The register function needs to return a user object as per its signature
return { ...data, ...tokens };
}

throw new Error('Registration failed (unexpected response)');
}
