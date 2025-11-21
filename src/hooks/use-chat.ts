
'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage, Chat } from '@/types';
import { getCurrentUserId } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [presence, setPresence] = useState<Record<number, {
    is_online: boolean;
    last_seen: string | null;
  }>>({});
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);

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

    fetch(`${API_BASE_URL}/chats/${chatId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setChatInfo(data))
      .catch(err => console.error("Failed to fetch chat details:", err));

    fetch(`${API_BASE_URL}/chats/${chatId}/messages/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: any[]) => {
        const formatted = data.map((raw: any) => {
          const senderId = raw.sender_id ?? raw.sender?.id;
          const isOwn = senderId === currentUserId;
          return {
            id: raw.id,
            content: raw.content ?? raw.message,
            sender: senderId,
            created_at: raw.created_at,
            status: isOwn ? evaluateStatus(raw.message_status) : undefined,
          };
        });
        setMessages(formatted);
      })
      .catch(err => console.error("Message load failed:", err));
  }, [token, chatId, currentUserId, evaluateStatus]);

  useEffect(() => {
    if (!token || !chatId) return;

    const connect = () => {
      const ws = new WebSocket(
        `${WS_BASE_URL}/chat/${chatId}/?token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => console.log("WS Connected");
      ws.onclose = () => {
        console.log("WS Disconnected, attempting to reconnect...");
        setTimeout(connect, 5000); // Reconnect after 5 seconds
      };
      ws.onerror = (e) => console.error("WS ERROR:", e);

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

    return () => wsRef.current?.close();
  }, [chatId, token, currentUserId]);

  const handleIncomingMessage = (raw: any) => {
    const senderId = raw.sender_id ?? raw.sender?.id;
    const isOwn = senderId === currentUserId && raw.temp_id;

    const incoming: ChatMessage = {
      id: raw.id,
      temp_id: raw.temp_id,
      content: raw.message ?? raw.content,
      sender: senderId,
      created_at: raw.created_at,
      pending: false,
      status: isOwn ? evaluateStatus(raw.message_status) : undefined,
    };

    setMessages(prev => {
      if (isOwn) {
        return prev.map(m =>
          String(m.temp_id) === String(raw.temp_id) ? incoming : m
        );
      }
      if (prev.some(m => m.id === incoming.id)) return prev;
      return [...prev, incoming];
    });
  };
  
  const handleReadUpdateForAll = (messageId: number | string, readerId: number) => {
      if (readerId === currentUserId) return; // Don't update status for my own read events
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

  const sendTyping = useCallback((isTyping: boolean) => {
    wsRef.current?.send(
      JSON.stringify({
        message_type: "typing",
        is_typing: isTyping,
      })
    );
  }, []);

  const sendReadStatus = useCallback((messageId: number | string) => {
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
    sendTyping,
    sendReadStatus,
    presence,
    chatInfo,
  };
}
