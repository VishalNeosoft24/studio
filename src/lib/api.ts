
import type { User, Chat, ApiMessage } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// 🔑 Get JWT token from localStorage
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// 👤 Get current user ID from token
export function getCurrentUserId(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // The user ID is in the 'user_id' field in the JWT payload
    return parseInt(payload.user_id, 10);
  } catch (error) {
    console.error("Failed to parse token:", error);
    return null;
  }
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
    // Special handling for 401 Unauthorized to redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
       console.error("Unauthorized request, redirecting to login.");
       localStorage.removeItem('access_token');
       localStorage.removeItem('refresh_token');
       window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred.' }));
    throw new Error(errorData.detail || `API Error (${response.status})`);
  }

  // Handle empty response bodies for methods like POST/DELETE
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null;
  }

  return response.json();
}


export async function getChats(): Promise<Chat[]> {
  return await apiFetch("/chats/");
}


/**
 * 💬 Fetch messages for a chat
 */
export async function getMessages(chatId: string): Promise<ApiMessage[]> {
  return await apiFetch(`/chats/${chatId}/messages/`);
}

export async function login(username: string, password: string) {
    console.log('Attempting login for:', username);
    
    const response = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
    }

    if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        console.log('Login successful, tokens saved.');
        return data;
    }

    throw new Error('Invalid login response (missing tokens)');
}


/** 🆕 Register a new user */
export async function register(username: string, password: string): Promise<User> {
    console.log('Registering user:', username);

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Extract error message from Django REST Framework response
        const errorMsg = data.username?.[0] || data.password?.[0] || 'Registration failed.';
        throw new Error(errorMsg);
    }
    
    if (data && data.username) {
        console.log('Registration successful, auto logging in...');
        await login(username, password);
        return data as User;
    }

    throw new Error('Registration failed (unexpected response)');
}
