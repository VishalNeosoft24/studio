
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUserId } from '@/lib/api';
import type { Message } from '@/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketHook = {
  sendMessage: (message: string) => boolean;
  sendImage: (image: string, caption: string) => boolean;
  isConnected: boolean;
};

// This function transforms the WebSocket message payload into the Message type for the UI
const transformWsMessage = (wsMsg: any): Message => {
  const currentUserId = getCurrentUserId();
  // Timestamps from python backend might have a space instead of 'T'
  const validTimestamp = wsMsg.created_at.replace(' ', 'T') + 'Z';
  
  return {
    id: wsMsg.id.toString(),
    chatId: wsMsg.chat_id.toString(),
    sender: wsMsg.sender_id === currentUserId ? 'me' : 'contact',
    type: wsMsg.message_type === 'image' ? 'image' : 'text',
    text: wsMsg.message || '',
    imageUrl: wsMsg.image || null,
    timestamp: new Date(validTimestamp),
    status: 'sent', // Default status for new messages
  };
};

export function useWebSocket(chatId: string): WebSocketHook {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = useCallback((text: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open. Cannot send message.');
      return false;
    }

    const payload = JSON.stringify({
      message_type: "text",
      message: text,
    });

    ws.current.send(payload);
    console.log("⬆️ WS sent (text):", payload);
    return true;
  }, []);
  
  const sendImage = useCallback((image: string, caption: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open. Cannot send image.');
        return false;
    }

    const payload = JSON.stringify({
        message_type: "image",
        image: image, // base64 data URL
        message: caption,
    });

    ws.current.send(payload);
    console.log("⬆️ WS sent (image):", { message_type: "image", message: caption, image: "..." });
    return true;
  }, []);

  useEffect(() => {
    if (!chatId) return;
    
    let isComponentMounted = true;

    const connect = () => {
      if (!isComponentMounted || (ws.current && ws.current.readyState === WebSocket.OPEN)) {
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
      };

      socket.onmessage = (event) => {
        if (!isComponentMounted) return;
        
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WS received:", data);

          if ((data.type === 'chat_message' || data.type === 'chat.message') && data.message) {
            const newMessage = transformWsMessage(data.message);
            
            queryClient.setQueryData<Message[]>(['messages', newMessage.chatId], (oldData) => {
              const existingData = oldData ?? [];
              // Prevent duplicates
              if (existingData.some(msg => msg.id === newMessage.id)) {
                return existingData;
              }
              return [...existingData, newMessage];
            });
            
            // Invalidate chats list to update last message preview, etc.
            queryClient.invalidateQueries({ queryKey: ['chats'] });

          } else if (data.type === 'delivery_status') {
             queryClient.setQueryData<Message[]>(['messages', chatId], (oldData = []) =>
              oldData.map(m => m.id === data.message_id.toString() ? { ...m, status: data.status } : m)
            );
          }
        } catch (e) {
          console.error('Failed to process incoming WebSocket message', e);
        }
      };

      socket.onclose = (event) => {
        if (!isComponentMounted) return;
        console.log('❌ WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        ws.current = null;
        if(isComponentMounted && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        if (!isComponentMounted) return;
        console.error('WebSocket error:', error);
        // The onclose event will be fired next, which will handle reconnection.
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.onclose = null; 
        ws.current.close();
        console.log("WebSocket connection closed on component unmount.");
      }
    };
  }, [chatId, queryClient]);

  return { sendMessage, sendImage, isConnected };
}
