'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  color: string;
}

interface UseYjsProviderResult {
  ydoc: any | null;
  provider: any | null;
  connected: boolean;
}

export function useYjsProvider(documentId: string, user: User | null): UseYjsProviderResult {
  const [provider, setProvider] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [ydoc, setYdoc] = useState<any>(null);
  const providerRef = useRef<any>(null);

  const userString = useMemo(() => (user ? JSON.stringify(user) : 'null'), [user]);

  useEffect(() => {
    let isMounted = true;

    // Dynamically load Yjs ONLY in the browser
    Promise.all([
      import('yjs'),
      import('y-websocket')
    ]).then(([YModule, WSModule]) => {
      if (!isMounted) return;

      const Y = YModule;
      const WebsocketProvider = WSModule.WebsocketProvider;
      
      const newDoc = new Y.Doc();
      setYdoc(newDoc);

      const parsedUser = userString !== 'null' ? JSON.parse(userString) : {};
      
      try {
        const wsProvider = new WebsocketProvider(
          'ws://localhost:3002',
          documentId,
          newDoc,
          { params: parsedUser }
        );

        providerRef.current = wsProvider;

        wsProvider.on('status', ({ status }: { status: string }) => {
          if (isMounted) {
            console.log('WebSocket status:', status);
            setConnected(status === 'connected');
          }
        });

        wsProvider.on('connection-error', () => {
          if (isMounted) setConnected(false);
        });

        if (isMounted) setProvider(wsProvider);
      } catch (error) {
        console.error('Failed to create Yjs provider:', error);
      }
    }).catch(err => {
      console.error("Failed to load yjs modules", err);
    });

    return () => {
      isMounted = false;
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
    };
  }, [documentId, userString]); 

  return {
    ydoc,
    provider,
    connected
  };
}