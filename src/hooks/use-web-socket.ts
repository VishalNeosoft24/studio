
'use client';

import { useEffect, useRef } from 'react';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000/ws';

export function useWebSocket(chatId: string, onMessage: (event: MessageEvent) => void) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const socket = new WebSocket(`${WS_BASE_URL}/chat/${chatId}/`);

    socket.onopen = () => {
      console.log('WebSocket connection established for chat', chatId);
    };

    socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      onMessage(event);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      // Optionally, you can implement reconnection logic here
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current = socket;

    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [chatId, onMessage]); // Re-run the effect if chatId or the onMessage handler changes

  // Function to send a message through the WebSocket
  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.error('WebSocket is not open. Ready state:', ws.current?.readyState);
    }
  };

  return { sendMessage };
}

    