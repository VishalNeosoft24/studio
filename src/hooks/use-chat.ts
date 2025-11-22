
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ChatMessage, ApiMessage } from '@/types';
import { getCurrentUserId, getMessages, sendImage } from '@/lib/api';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [presence, setPresence] = useState<Record<number, { is_online: boolean; last_seen: string | null; }>>({});
  
  const currentUserId = getCurrentUserId();
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
  const readSentSet = useRef<Set<number | string>>(new Set());

  const evaluateStatus = useCallback((statuses: Array<{ status: string }> | undefined): 'sent' | 'delivered' | 'read' => {
    if (!statuses?.length) return 'sent';
    if (statuses.some(s => s.status === 'read')) return 'read';
    if (statuses.some(s => s.status === 'delivered')) return 'delivered';
    return 'sent';
  }, []);

  useEffect(() => {
    if (!token || !chatId) return;

    getMessages(chatId)
      .then((data) => {
        const formatted = data.map((raw: any) => ({
          id: raw.id,
          content: raw.content,
          sender: raw.sender.id,
          created_at: raw.created_at,
          image_url: raw.image,
          status: raw.sender.id === currentUserId ? evaluateStatus(raw.message_status) : undefined,
          pending: false,
        }));
        setMessages(formatted);
      })
      .catch(err => console.error("Message load failed:", err));
  }, [token, chatId, currentUserId, evaluateStatus]);

  useEffect(() => {
    if (!token || !chatId || !WS_BASE_URL) return;

    const connect = () => {
      const ws = new WebSocket(
        `${WS_BASE_URL}/ws/chat/${chatId}/?token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => console.log("WS Connected");
      
      ws.onclose = (e) => {
        console.error(
          `WS Disconnected. Code: ${e.code}, Reason: ${e.reason}. Attempting to reconnect...`
        );
        // Standard close codes: 1000 (Normal), 1001 (Going Away), 1005 (No Status Received)
        // We will attempt to reconnect on any other code.
        if (e.code !== 1000 && e.code !== 1001 && e.code !== 1005) {
            setTimeout(connect, 5000);
        }
      };
      
      ws.onerror = (e) => {
        console.error("WS ERROR:", e);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "chat.message":
            handleIncomingMessage(data.message);
            break;
          case "delivery_status":
            handleDeliveryUpdate(data);
            break;
          case "message_read":
          case "read_notification":
             handleReadUpdateForAll(data.message_id, data.user_id);
            break;
          case "typing":
            handleTypingUpdate(data);
            break;
          case "presence_update":
            handlePresenceUpdate(data);
            break;
        }
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, token]);

  const handleIncomingMessage = (raw: any) => {
    const isOwn = raw.sender_id === currentUserId && raw.temp_id;
    
    const incoming: ChatMessage = {
      id: raw.id,
      temp_id: raw.temp_id,
      content: raw.message,
      image_url: raw.image_url,
      sender: raw.sender_id,
      created_at: raw.created_at,
      pending: false,
      status: 'sent',
    };

    setMessages(prev => {
      if (isOwn) {
        return prev.map(m => m.temp_id === raw.temp_id ? incoming : m);
      }
      if (prev.some(m => m.id === incoming.id)) return prev;
      return [...prev, incoming];
    });
  };
  
  const handleReadUpdateForAll = (messageId: number | string, readerId: number) => {
      if (readerId === currentUserId) return;
      setMessages(prev =>
          prev.map(m => {
              if (m.sender === currentUserId && m.status !== 'read' && Number(m.id) <= Number(messageId)) {
                  return { ...m, status: 'read' };
              }
              return m;
          })
      );
  };

  const handleDeliveryUpdate = ({ message_id, message_status }: any) => {
    const finalStatus = evaluateStatus(message_status);
    setMessages(prev =>
      prev.map(m =>
        m.id.toString() === message_id.toString() && m.sender === currentUserId && m.status !== 'read'
          ? { ...m, status: finalStatus }
          : m
      )
    );
  };

  const handleTypingUpdate = (data: any) => {
    const uid = data.user_id;
    if (uid === currentUserId) return;
    setTypingUsers(prev =>
      data.is_typing
        ? [...new Set([...prev, uid])]
        : prev.filter(id => id !== uid)
    );
  };

  const handlePresenceUpdate = (data: any) => {
    setPresence((prev) => ({
      ...prev,
      [data.user_id]: {
        is_online: data.is_online,
        last_seen: data.last_seen,
      },
    }));
  };

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.error("Cannot send message, WebSocket is not open.");
      return;
    }

    const temp_id = Date.now().toString();
    const optimistic: ChatMessage = {
      id: temp_id,
      temp_id: temp_id,
      content: text,
      sender: currentUserId!,
      status: "sending",
      pending: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    wsRef.current?.send(
      JSON.stringify({
        message_type: "text",
        message: text,
        temp_id,
      })
    );
  }, [currentUserId]);

  const sendImageMessage = useCallback(async (file: File) => {
    if (!currentUserId) return;
    
    const temp_id = Date.now().toString();
    const previewUrl = URL.createObjectURL(file);

    const optimisticMessage: ChatMessage = {
      id: temp_id,
      temp_id: temp_id,
      content: '', 
      image_url: previewUrl,
      sender: currentUserId,
      status: 'sending',
      pending: true,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // The actual upload is fire-and-forget from the client's perspective now.
      // The WebSocket message will confirm the final URL.
      await sendImage(chatId, file, temp_id);
    } catch (error) {
      console.error("Image upload failed:", error);
      // Revert optimistic update on failure
      setMessages(prev => prev.map(msg => 
        msg.id === temp_id ? { ...msg, status: 'sent', pending: false, content: "Failed to send image." } : msg
      ));
    }
  }, [chatId, currentUserId]);


  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
        // It's okay to fail silently here, typing is not critical
        return;
    }
    wsRef.current?.send(
      JSON.stringify({
        message_type: "typing",
        is_typing: isTyping,
      })
    );
  }, []);

  const sendReadStatus = useCallback((messageId: number | string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      // It's okay to fail silently here, read status will sync eventually
      return;
    }
    if (readSentSet.current.has(messageId)) return;
    readSentSet.current.add(messageId);
    wsRef.current?.send(
      JSON.stringify({
        message_type: "read",
        message_id: messageId,
      })
    );
  }, []);

  return {
    messages,
    typingUsers,
    sendMessage,
    sendImageMessage,
    sendTyping,
    sendReadStatus,
    presence,
    wsRef,
  };
}
