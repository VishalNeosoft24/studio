
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { Message } from '@/types';
import { getCurrentUserId } from '@/lib/api';
import { usePresenceStore } from '@/stores/use-presence-store';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketHook = {
  sendMessage: (message: string) => boolean;
  sendImage: (image: string, caption: string) => boolean;
  sendTyping: (isTyping: boolean) => void;
  isConnected: boolean;
};

export function useWebSocket(chatId: string | null, queryClient: QueryClient): WebSocketHook {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendRaw = useCallback((payload: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      return true;
    }
    console.error('WebSocket is not open. Cannot send data.');
    return false;
  }, []);

  const sendMessage = useCallback((text: string) => {
    console.log("⬆️ WS sent (text):", text);
    return sendRaw({ message_type: "text", message: text });
  }, [sendRaw]);
  
  const sendImage = useCallback((image: string, caption: string) => {
    return sendRaw({ message_type: "image", image: image, message: caption });
  }, [sendRaw]);

  const sendTyping = useCallback((isTyping: boolean) => {
    sendRaw({ message_type: "typing", is_typing: isTyping });
  }, [sendRaw]);

  const sendPing = useCallback(() => {
    sendRaw({ message_type: "ping" });
  }, [sendRaw]);

  useEffect(() => {
    if (!chatId) {
      return;
    }
    
    let isComponentMounted = true;
    const currentUserId = getCurrentUserId();
    const { setPresence, setTyping } = usePresenceStore.getState();

    // This transformer is for WS messages ONLY.
    // It correctly parses the payload from your Python consumer.
    const transformWsMessage = (wsMsg: any): Message => {
        const senderId = wsMsg.sender_id;
    
        return {
          id: wsMsg.id.toString(),
          chatId: wsMsg.chat_id.toString(), // CRITICAL FIX: Use chat_id from the payload
          sender: senderId === currentUserId ? 'me' : 'contact',
          type: wsMsg.image ? 'image' : 'text',
          text: wsMsg.message || '',
          imageUrl: wsMsg.image || null,
          timestamp: new Date(wsMsg.created_at.replace(' ', 'T') + 'Z'), // Make it ISO compliant
          status: 'sent', // Default status, can be updated later
        };
    };

    const cleanup = () => {
      isComponentMounted = false;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws.current) {
        ws.current.onclose = null; 
        console.log(`WebSocket closing connection for chat: ${chatId}`);
        ws.current.close();
      }
      ws.current = null;
    };

    const connect = () => {
      if (!isComponentMounted || ws.current) return;
      
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No auth token, retrying in 5s...");
        if(isComponentMounted) reconnectTimeoutRef.current = setTimeout(connect, 5000);
        return;
      }
      
      const socketUrl = `${WS_BASE_URL}/chat/${chatId}/?token=${token}`;
      console.log(`Attempting to connect to WebSocket: ${socketUrl}`);
      
      const socket = new WebSocket(socketUrl);
      ws.current = socket;

      socket.onopen = () => {
        if (!isComponentMounted) return socket.close();
        console.log(`✅ WebSocket connection established for chat ${chatId}`);
        setIsConnected(true);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        pingIntervalRef.current = setInterval(sendPing, 30000);
      };

      socket.onmessage = (event) => {
        if (!isComponentMounted) return;
        
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WS received:", data);

          if ((data.type === 'chat_message' || data.type === 'chat.message') && data.message) {
            const newMessage = transformWsMessage(data.message);
            
            queryClient.setQueryData<Message[]>(['messages', newMessage.chatId], (oldData) => {
              const existingMessages = oldData ?? [];
              if (existingMessages.some(msg => msg.id === newMessage.id)) {
                return existingMessages; // Avoid duplicates
              }
              return [...existingMessages, newMessage];
            });
            queryClient.invalidateQueries({ queryKey: ['chats'] });

          } else if (data.type === 'delivery_status') {
            queryClient.setQueryData<Message[]>(['messages', chatId], (oldData = []) =>
              oldData.map(m => m.id === String(data.message_id) ? { ...m, status: data.status } : m)
            );
          } else if (data.type === 'presence_update') {
            setPresence(data.user_id, data.is_online, data.last_seen);
            queryClient.invalidateQueries({queryKey: ['chats']});
          } else if (data.type === 'typing' && data.user_id !== currentUserId) {
            setTyping(String(chatId), data.user_id, data.is_typing);
          }
        } catch (e) {
          console.error('Failed to process incoming WebSocket message', e);
        }
      };

      socket.onclose = (event) => {
        if (!isComponentMounted) return;
        console.log(`❌ WebSocket connection closed: ${event.code}`, event.reason);
        setIsConnected(false);
        ws.current = null;
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        if (event.code !== 1000 && isComponentMounted) {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
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
