
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { usePresenceStore } from '@/stores/use-presence-store';
import { transformApiMessage, getCurrentUserId } from '@/lib/api';
import type { Message } from '@/types';


const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketHook = {
  sendMessage: (message: string) => boolean;
  sendImage: (image: string, caption: string) => boolean;
  sendTyping: (isTyping: boolean) => void;
  isConnected: boolean;
};

export function useWebSocket(chatId: string, queryClient: QueryClient): WebSocketHook {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendRaw = (payload: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      return true;
    }
    console.error('WebSocket is not open. Cannot send message.');
    return false;
  }

  const sendMessage = useCallback((text: string) => {
    console.log("⬆️ WS sent (text):", text);
    return sendRaw({ message_type: "text", message: text });
  }, []);
  
  const sendImage = useCallback((image: string, caption: string) => {
    console.log("⬆️ WS sent (image):", { message: caption, image: "..." });
    return sendRaw({ message_type: "image", image: image, message: caption });
  }, []);
  
  const sendTyping = useCallback((isTyping: boolean) => {
    sendRaw({ message_type: "typing", is_typing: isTyping });
  }, []);

  const sendPing = useCallback(() => {
    sendRaw({ message_type: "ping" });
  }, []);

  useEffect(() => {
    if (!chatId) return;
    
    let isComponentMounted = true;

    const cleanup = () => {
      isComponentMounted = false;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
        ws.current = null;
        console.log("WebSocket connection closed on unmount for chat:", chatId);
      }
    };

    const connect = () => {
      if (!isComponentMounted || ws.current) {
        return;
      }
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No auth token found for WebSocket connection.");
        if(isComponentMounted && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
        return;
      }
      
      const socketUrl = `${WS_BASE_URL}/chat/${chatId}/?token=${token}`;
      console.log("Attempting to connect to WebSocket:", socketUrl);
      
      const socket = new WebSocket(socketUrl);
      ws.current = socket;

      socket.onopen = () => {
        if (!isComponentMounted) return;
        console.log('✅ WebSocket connection established for chat', chatId);
        setIsConnected(true);

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        pingIntervalRef.current = setInterval(sendPing, 30000);
      };

      socket.onmessage = (event) => {
        if (!isComponentMounted) return;

        try {
            const data = JSON.parse(event.data);
            console.log("📩 WS received:", data);
            const { setPresence, setTyping } = usePresenceStore.getState();
            const currentUserId = getCurrentUserId();

            if ((data.type === 'chat_message' || data.type === 'chat.message') && data.message) {
                const newMessage = transformApiMessage(data.message);
                
                if (String(newMessage.chatId) === String(chatId)) {
                    queryClient.setQueryData<Message[]>(['messages', chatId], (oldMessages) => {
                        const existingMessages = oldMessages ?? [];
                        if (existingMessages.some(msg => msg.id === newMessage.id)) {
                            return existingMessages;
                        }
                        return [...existingMessages, newMessage];
                    });
                     // Also invalidate the main chats query to update last message preview
                    queryClient.invalidateQueries({ queryKey: ['chats'], exact: true });
                }
            } 
            else if (data.type === 'delivery_status') {
                queryClient.setQueryData<Message[]>(['messages', chatId], (oldMessages = []) =>
                oldMessages.map(m =>
                    m.id === data.message_id
                    ? { ...m, status: data.status }
                    : m
                )
                );
            }
            else if (data.type === 'presence_update') {
                setPresence(data.user_id, data.is_online, data.last_seen);
                queryClient.invalidateQueries({queryKey: ['chats']});
            }
            else if (data.type === 'typing') {
                if (data.user_id !== currentUserId) {
                    setTyping(String(chatId), data.user_id, data.is_typing);
                }
            }

        } catch (e) {
            console.error('Failed to parse incoming WebSocket message', e);
        }
      };

      socket.onclose = (event) => {
        if (!isComponentMounted) return;
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        ws.current = null;

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        if(isComponentMounted && !reconnectTimeoutRef.current) {
            console.log('Attempting to reconnect in 3 seconds...');
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        if (!isComponentMounted) return;
        console.error('WebSocket error:', error);
        socket.close();
      };
    };

    connect();

    return cleanup;
  }, [chatId, queryClient, sendPing]);

  return { sendMessage, sendImage, sendTyping, isConnected };
}
