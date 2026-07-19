'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function WebsocketTest() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to the NestJS WebSocket server
    const socket: Socket = io('http://localhost:3001', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket!');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg border text-sm font-medium flex items-center gap-2 ${
            isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
            <div
            className={`w-2.5 h-2.5 rounded-full ${
                isConnected
                ? 'bg-emerald-500'
                : 'bg-red-500 animate-pulse'
            }`}
            />
            WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
}