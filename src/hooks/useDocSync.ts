'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function useDocSync(documentId: string, ownerId: string, isEnabled: boolean) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastVersion, setLastVersion] = useState<number>(0);

  useEffect(() => {
    if (!documentId || !ownerId || !isEnabled) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getDocument(documentId, ownerId);
        if (!res.updatedAt) return;
        
        const serverVersion = new Date(res.updatedAt).getTime();
        
        // Only re-render if the timestamp actually changed
        if (serverVersion > lastVersion) {
          setLastVersion(serverVersion);
          setIsSyncing(true);
          // Brief visual feedback
          setTimeout(() => setIsSyncing(false), 500);
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 500);

    return () => clearInterval(interval);
  }, [documentId, ownerId, isEnabled, lastVersion]);

  return { isSyncing };
}