
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import type { Message, WsMessagePayload, PresenceState } from '@/types';
import { getCurrentUserId } from '@/lib/api';
import { usePresenceStore } from '@/stores/use-presence-store';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketHook = {
  sendMessage: (message: string) => boolean;
  sendImage: (image: string, caption: string) => boolean;
  sendTyping: (isTyping: boolean) => void;
  sendReadReceipt: (messageId: string) => void;
  isConnected: boolean;
};

export function useWebSocket(chatId: string, queryClient: QueryClient): WebSocketHook {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback((messageText: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open. Cannot send message.');
      return false;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const currentTime = new Date();

    queryClient.setQueryData<Message[]>([`messages-optimistic-${chatId}`], (old = []) => {
      const optimisticMessage: Message = {
        id: tempId,
        chatId: chatId,
        sender: 'me',
        type: 'text',
        text: messageText,
        imageUrl: null,
        timestamp: currentTime,
        status: 'sending',
      };
      return [...old, optimisticMessage];
    });

    const payload = JSON.stringify({ 
      message_type: "text", 
      message: messageText, 
      temp_id: tempId 
    });
    ws.current.send(payload);
    console.log("⬆️ WS sent (text):", payload);
    return true;
  }, [chatId, queryClient]);

  const sendImage = useCallback((imageData: string, imageCaption: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open. Cannot send image.');
      return false;
    }

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const currentTime = new Date();

    queryClient.setQueryData<Message[]>([`messages-optimistic-${chatId}`], (old = []) => {
      const optimisticMessage: Message = {
        id: tempId,
        chatId: chatId,
        sender: 'me',
        type: 'image',
        text: imageCaption,
        imageUrl: imageData,
        timestamp: currentTime,
        status: 'sending',
      };
      return [...old, optimisticMessage];
    });

    const payload = JSON.stringify({ 
      message_type: "image", 
      image: imageData, 
      message: imageCaption,
      temp_id: tempId
    });
    ws.current.send(payload);
    console.log("⬆️ WS sent (image):", { message_type: "image", message: imageCaption, temp_id: tempId, image: "..." });
    return true;
  }, [chatId, queryClient]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message_type: 'typing', is_typing: isTyping }));
    }
  }, []);

  const sendReadReceipt = useCallback((messageId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message_type: 'read', message_id: messageId }));
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;

    let isComponentMounted = true;
    const { setPresence, setTyping } = usePresenceStore.getState();

    const connect = () => {
      if (!isComponentMounted || (ws.current && ws.current.readyState === WebSocket.OPEN)) return;

      const token = localStorage.getItem("access_token");
      if (!token) {
        if (isComponentMounted && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        }
        return;
      }

      const socketUrl = `${WS_BASE_URL}/chat/${chatId}/?token=${token}`;
      const socket = new WebSocket(socketUrl);
      ws.current = socket;

      socket.onopen = () => {
        if (!isComponentMounted) return;
        setIsConnected(true);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ message_type: 'ping' }));
          }
        }, 30000);
      };

      socket.onmessage = (event) => {
        if (!isComponentMounted) return;
        
        try {
          const data = JSON.parse(event.data);
          console.log("📩 WS received:", data);

          if ((data.type === 'chat_message' || data.type === 'chat.message') && data.message) {
            const wsMsg: WsMessagePayload = data.message;
            
            // Critical fix: ensure created_at exists before processing
            if (!wsMsg.created_at) {
              console.error("Received chat message with invalid timestamp:", wsMsg);
              return;
            }

            const currentUserId = getCurrentUserId();
            const tempId = wsMsg.temp_id;
            
            if (tempId) {
              queryClient.setQueryData<Message[]>([`messages-optimistic-${chatId}`], (old = []) => 
                 old.filter(m => m.id !== tempId)
              );
            }
            
            queryClient.setQueryData<Message[]>(['messages', chatId], (oldData = []) => {
              if (oldData.some(msg => msg.id === wsMsg.id.toString())) {
                return oldData;
              }
              const validTimestamp = (wsMsg.created_at || '').includes('T') 
                ? wsMsg.created_at 
                : (wsMsg.created_at || '').replace(' ', 'T') + 'Z';
              
              const newMessage: Message = {
                id: wsMsg.id.toString(),
                chatId: chatId,
                sender: String(wsMsg.sender_id) === String(currentUserId) ? 'me' : 'contact',
                type: wsMsg.message_type === 'image' ? 'image' : 'text',
                text: wsMsg.message || '',
                imageUrl: wsMsg.image || null,
                timestamp: new Date(validTimestamp),
                status: 'sent',
              };
              
              return [...oldData, newMessage];
            });
            
            queryClient.invalidateQueries({ queryKey: ['chats'] });

          } else if (data.type === 'delivery_status') {
            queryClient.setQueryData<Message[]>(['messages', chatId], (oldData = []) =>
              oldData.map(m => 
                m.id === data.message_id.toString() && m.status !== 'read' 
                  ? { ...m, status: 'delivered' } 
                  : m
              )
            );
          } else if (data.type === 'read_notification') {
            queryClient.setQueryData<Message[]>(['messages', chatId], (oldData = []) =>
              oldData.map(m => 
                m.id === data.message_id.toString() 
                  ? { ...m, status: 'read' } 
                  : m
              )
            );
          } else if (data.type === 'presence_update' || (data.event_type === 'presence_update' && data.payload)) {
            const payload = data.type === 'presence_update' ? data : data.payload;
            setPresence(payload.user_id, payload.is_online, payload.last_seen);
          } else if (data.type === 'typing') {
            setTyping(chatId, data.user_id, data.is_typing);
          }
        } catch (e) {
          console.error('Failed to process incoming WebSocket message', e);
        }
      };

      socket.onclose = (event) => {
        if (!isComponentMounted) return;
        setIsConnected(false);
        ws.current = null;
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        if (isComponentMounted && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (error) => {
        if (!isComponentMounted) return;
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [chatId, queryClient]);

  return { sendMessage, sendImage, sendTyping, sendReadReceipt, isConnected };
}
