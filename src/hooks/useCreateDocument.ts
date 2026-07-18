import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DEFAULT_DOC_TITLE = 'Untitled Document';

export function useCreateDocument() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const create = async (userId: string, title?: string) => {
    if (creating) return;
    setCreating(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: title ?? DEFAULT_DOC_TITLE,
        }),
      });

      if (!res.ok) throw new Error('Failed to create');

      const doc = await res.json();
      router.push(`/editor/${doc.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create document');
      setCreating(false);
    }
  };

  return { create, creating };
}