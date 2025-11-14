

import type { User, Chat, ApiMessage, Message, RegisterPayload, ApiContact, Contact, CreateChatPayload, AddContactPayload, UpdateProfilePayload, UpdateContactPayload } from '@/types';

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
    // Ensure it's treated as a number
    const userId = payload.user_id;
    return typeof userId === 'string' ? parseInt(userId, 10) : userId;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return null;
  }
}

// 🌐 Common fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  // Check if body is FormData, if so, don't set Content-Type header
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Special handling for 401 Unauthorized to redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
       console.error("Unauthorized request, redirecting to login.");
       logout();
       window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({ detail: 'An unknown API error occurred.' }));
    throw new Error(errorData.detail || `API Error (${response.status})`);
  }

  // Handle empty response bodies for methods like POST/DELETE
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null;
  }

  // Handle cases where creating a resource might return an existing one (200 OK) or a new one (201 Created)
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }
  
  return response.json();
}

/** 👤 Profile API */
export async function getProfile(): Promise<User> {
  return await apiFetch('/auth/profile/');
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return await apiFetch('/auth/profile/', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function uploadProfilePicture(file: File): Promise<{ profile_picture_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiFetch('/auth/profile-picture/', {
        method: 'POST',
        body: formData,
    });
}

export async function removeProfilePicture(): Promise<null> {
    return await apiFetch('/auth/profile-picture/', {
        method: 'DELETE',
    });
}


export async function getChats(): Promise<Chat[]> {
  return await apiFetch("/chats/");
}

export async function createChat(payload: CreateChatPayload): Promise<Chat> {
  // This can return a 200 (existing) or 201 (new), which apiFetch handles.
  return await apiFetch('/chats/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getContacts(): Promise<Contact[]> {
    const apiContacts: ApiContact[] = await apiFetch("/contacts/");
    
    // Transform the API response into the flat structure our UI expects
    return apiContacts.map(item => {
        if (item.is_registered && item.contact) {
            return {
                id: item.contact.id.toString(),
                name: item.name, // Use the user-defined name for the contact
                avatarUrl: item.contact.profile_picture_url,
                isMuted: item.is_muted,
                about: item.contact.about_status,
                isRegistered: true,
            };
        } else {
            return {
                id: `phone-${item.phone_number}`, // Use phone number for a unique ID for non-registered
                name: item.name, // Use the name from phone contacts
                avatarUrl: null,
                isMuted: false,
                about: `Invite ${item.name} to Chatterbox`,
                isRegistered: false,
            };
        }
    });
}

export async function addContact(payload: AddContactPayload): Promise<ApiContact> {
    return await apiFetch('/contacts/add/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateContact(contactId: number, payload: UpdateContactPayload): Promise<ApiContact> {
    return await apiFetch(`/contacts/update-by-user/${contactId}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}


/**
 * 💬 Fetch messages for a chat
 */
export async function getMessages(chatId: string): Promise<ApiMessage[]> {
  return await apiFetch(`/chats/${chatId}/messages/`);
}

/**
 * Transforms a message from the initial REST API fetch into a format the UI can use.
 * This is for OLD messages loaded via HTTP.
 */
export function transformApiMessage(apiMsg: ApiMessage): Message {
    const currentUserId = getCurrentUserId();
    
    return {
      id: apiMsg.id.toString(),
      chatId: apiMsg.chat.toString(), 
      sender: apiMsg.sender.id === currentUserId ? 'me' : 'contact',
      type: apiMsg.image ? 'image' : 'text',
      text: apiMsg.content || '',
      imageUrl: apiMsg.image || null,
      timestamp: new Date(apiMsg.created_at),
      status: 'sent', // Default status, can be updated by delivery receipts
    };
};


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
export async function register(payload: RegisterPayload): Promise<User> {
    console.log('Registering user:', payload.username);

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Extract a generic or specific error message from the backend response
        const errorMsg = data.detail || Object.values(data).flat().join(' ') || 'Registration failed.';
        throw new Error(errorMsg);
    }
    
    if (data && data.username) {
        console.log('Registration successful, auto logging in...');
        await login(payload.username, payload.password);
        return data as User;
    }

    throw new Error('Registration failed (unexpected response)');
}

/** 🔒 Log out the user */
export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        console.log('User logged out, tokens removed.');
    }
}
