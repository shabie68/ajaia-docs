'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Editor from '@/components/Editor';
import { Document } from '@/types/document';
import ShareModal from '@/components/ShareModal';

// Auto-save interval in ms
const AUTO_SAVE_DELAY = 2000;

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [docId, setDocId] = useState<string>('');
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // For auto-save debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingContentRef = useRef<string | null>(null);

  useEffect(() => {
    params.then((p) => setDocId(p.id));
  }, [params]);

  // Fetch document
  const fetchDocument = useCallback(async () => {
    if (!docId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/documents/${docId}`);
      if (res.status === 404) {
        setError('Document not found');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setDocument(data);
      setLastSaved(new Date(data.updatedAt));

      // Check if user can edit
      const isOwner = data.owner.email === user?.email;
      const hasEditPermission = data.sharedWith?.some(
        (s: any) => s.email === user?.email && s.permission === 'edit'
      );
      setIsEditing(isOwner || hasEditPermission || false);
    } catch (err) {
      setError('Could not load document.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [docId, user]);

  useEffect(() => {
    if (user && docId) {
      fetchDocument();
    }
  }, [fetchDocument, user, docId]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Save document
  const saveDocument = useCallback(
    async (content?: string, title?: string) => {
      if (!docId || saving) return;
      setSaving(true);
      try {
        const body: any = {};
        if (content !== undefined) body.content = content;
        if (title !== undefined) body.title = title;

        const res = await fetch(`/api/documents/${docId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to save');
        setLastSaved(new Date());
      } catch (err) {
        console.error('Save error:', err);
        setError('Failed to save. Retrying...');
        // Retry once after 2s
        setTimeout(() => {
          saveDocument(content, title);
        }, 2000);
      } finally {
        setSaving(false);
      }
    },
    [docId, saving]
  );

  // Handle content changes with debounce
  const handleContentUpdate = useCallback(
    (json: string) => {
      pendingContentRef.current = json;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        if (pendingContentRef.current) {
          saveDocument(pendingContentRef.current);
          pendingContentRef.current = null;
        }
      }, AUTO_SAVE_DELAY);
    },
    [saveDocument]
  );

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    if (document) {
      setDocument({ ...document, title: newTitle });
      // Debounce title save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveDocument(undefined, newTitle);
      }, AUTO_SAVE_DELAY);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400">Loading document...</div>
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to documents
          </button>
        </div>
      </div>
    );
  }

  if (!document || !user) return null;

  const isOwner = document.owner.email === user.email;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Back to documents"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Document icon */}
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Title */}
          <input
            type="text"
            value={document.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-0.5 rounded-md hover:bg-gray-50 focus:bg-gray-50 transition-colors min-w-[200px] max-w-[400px]"
            placeholder="Untitled Document"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Save status */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {saving ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Saving...
              </>
            ) : lastSaved ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Saved {lastSaved.toLocaleTimeString()}
              </>
            ) : null}
          </div>

          {/* Shared users avatars */}
          {document.sharedWith && document.sharedWith.length > 0 && (
            <div className="flex -space-x-2">
              {document.sharedWith.slice(0, 3).map((s) => (
                <div
                  key={s.userId}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: s.avatar || '#6b7280' }}
                  title={`${s.name} (${s.permission})`}
                >
                  {s.name[0]}
                </div>
              ))}
            </div>
          )}

          {/* Share button (only for owner) */}
          {isOwner && (
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}

          {/* Owner badge or permission badge */}
          {!isOwner && document.sharedWith?.[0]?.permission && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              document.sharedWith[0].permission === 'edit'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {document.sharedWith[0].permission === 'edit' ? 'Can edit' : 'Can view'}
            </span>
          )}

          {/* User avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user.avatar }}
            title={user.name}
          >
            {user.name[0]}
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && document && (
        <div className="mx-8 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-amber-500 hover:text-amber-700">✕</button>
        </div>
      )}

      {/* Editor Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-8">
        {/* Not editable notice */}
        {!isEditing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This document is shared with you in view-only mode.
          </div>
        )}

        <Editor
          content={document.content}
          editable={isEditing}
          onUpdate={isEditing ? handleContentUpdate : undefined}
        />
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          documentId={document.id}
          currentShares={document.sharedWith || []}
          onClose={() => {
            setShowShareModal(false);
            fetchDocument(); // Refresh to get updated shares
          }}
        />
      )}
    </div>
  );
}