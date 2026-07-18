'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseAutoSaveOptions {
  docId: string;
  delay?: number;
  maxRetries?: number;
}

export function useAutoSave({ docId, delay = 2000, maxRetries = 3 }: UseAutoSaveOptions) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const save = useCallback(async (data: { content?: string; title?: string }) => {
    if (!docId || saving) return;
    setSaving(true);

    try {
      const body: Record<string, string> = {};
      if (data.content !== undefined) body.content = data.content;
      if (data.title !== undefined) body.title = data.title;

      const res = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      setLastSaved(new Date());
      setError(null);
      setIsDirty(false);
      retryCountRef.current = 0;
    } catch {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setError(`Save failed. Retrying (${retryCountRef.current}/${maxRetries})...`);
        setTimeout(() => save(data), 2000 * retryCountRef.current);
      } else {
        setError('Failed to save. Changes may be lost.');
        retryCountRef.current = 0;
      }
    } finally {
      setSaving(false);
    }
  }, [docId, saving, maxRetries]);

  const scheduleContentSave = useCallback((content: string) => {
    setIsDirty(true);
    if (contentTimeoutRef.current) clearTimeout(contentTimeoutRef.current);
    contentTimeoutRef.current = setTimeout(() => save({ content }), delay);
  }, [save, delay]);

  const scheduleTitleSave = useCallback((title: string) => {
    setIsDirty(true);
    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
    titleTimeoutRef.current = setTimeout(() => save({ title }), delay);
  }, [save, delay]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (contentTimeoutRef.current) clearTimeout(contentTimeoutRef.current);
      if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
    };
  }, []);

  return {
    saving,
    lastSaved,
    error,
    isDirty,
    save,
    scheduleContentSave,
    scheduleTitleSave,
    clearError: () => setError(null),
  };
}