import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const DEFAULT_DOC_TITLE = 'Untitled Document';

export function useCreateDocument() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const create = async (userId: string, title?: string) => {
    if (creating) return;
    setCreating(true);

    try {
      const doc = await api.createDocument({ userId, title: title ?? 'Untitled Document' });
      router.push(`/editor/${doc.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create document');
      setCreating(false);
    }
  };

  return { create, creating };
}