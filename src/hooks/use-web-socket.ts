
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

type WebSocketHook = {
  sendMessage: (message: string) => boolean;
  isConnected: boolean;
};

export function useWebSocket(chatId: string, onMessage: (event: MessageEvent) => void): WebSocketHook {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
        console.error("No auth token found for WebSocket connection.");
        return;
    }
    
    const socketUrl = `${WS_BASE_URL}/chat/${chatId}/?token=${token}`;
    let socket = new WebSocket(socketUrl);
    ws.current = socket;

    const connect = () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
            return;
        }
        
        socket = new WebSocket(socketUrl);
        ws.current = socket;

        socket.onopen = () => {
            console.log('WebSocket connection established for chat', chatId);
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            console.log("Incoming message from WebSocket:", event.data);
            onMessage(event);
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            setIsConnected(false);
            // Optional: implement reconnection logic here
            // For now, we are not auto-reconnecting to avoid loops on auth errors
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
            socket.close(); // Ensure socket is closed on error
        };
    };

    connect();

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
        setIsConnected(false);
      }
    };
  }, [chatId, onMessage]);

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
    console.log("⬆️ WS sent:", payload);
    return true;
  }, []);

  return { sendMessage, isConnected };
}
