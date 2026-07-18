'use client';

import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import Editor from '@/components/Editor';
import { Document } from '@/types/document';
import ShareModal from '@/components/ShareModal';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { signOut } from 'next-auth/react';

const AUTO_SAVE_DELAY = 2000;

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Document state
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Auto-save hook
  const {
    saving,
    lastSaved,
    error: saveError,
    isDirty,
    scheduleContentSave,
    scheduleTitleSave,
    clearError: clearSaveError,
  } = useAutoSave({ docId: id, delay: AUTO_SAVE_DELAY });

  // Sync save errors to main error state
  useEffect(() => {
    if (saveError) setError(saveError);
  }, [saveError]);

  // Fetch document
  const fetchDocument = useCallback(async () => {
    if (!id) return;
    
    let cancelled = false;
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/documents/${id}`);
      
      if (cancelled) return;
      
      if (res.status === 404) {
        setError('Document not found');
        return;
      }
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      
      if (cancelled) return;
      
      setDocument(data);
      setLastSavedState(new Date(data.updatedAt));

      // Check permissions
      const isOwner = data.owner.email === user?.email;
      const myShare = data.sharedWith?.find(
        (s: { email: string; permission: string }) => s.email === user?.email
      );
      const hasEditPermission = myShare?.permission === 'edit';
      
      setIsEditing(isOwner || hasEditPermission || false);
    } catch (err) {
      if (!cancelled) {
        setError('Could not load document.');
        console.error(err);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }

    return () => { cancelled = true; };
  }, [id, user]);

  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [fetchDocument, user, id]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Handle content changes
  const handleContentUpdate = useCallback(
    (json: string) => {
      scheduleContentSave(json);
    },
    [scheduleContentSave]
  );

  // Handle title change
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      if (document) {
        setDocument((prev) => prev ? { ...prev, title: newTitle } : prev);
      }
      scheduleTitleSave(newTitle);
    },
    [document, scheduleTitleSave]
  );

  // Local last saved state (from server, separate from auto-save)
  const [lastSavedState, setLastSavedState] = useState<Date | null>(null);
  
  // Use the more recent of the two
  const displayLastSaved = lastSaved ?? lastSavedState;

  // Handle logout
  // const handleLogout = () => {
  //   if (isDirty) {
  //     const confirmed = window.confirm('You have unsaved changes. Leave anyway?');
  //     if (!confirmed) return;
  //   }
  //   router.push('/login');
  // };

  // Find handleLogout (or handleBack if you are logging out from there) and change it to:
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' }); // ✅ Real NextAuth logout
  };

  // Handle back navigation
  const handleBack = () => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Leave anyway?');
      if (!confirmed) return;
    }
    router.push('/dashboard');
  };

  // Derived values
  const isOwner = document?.owner.email === user?.email;
  const myPermission = document?.sharedWith?.find(
    (s: { email: string; permission: string }) => s.email === user?.email
  )?.permission;

  // ─── Loading State ───────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  // ─── Error State (no document loaded) ────────────────────────────
  if (error && !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-1 font-medium">Something went wrong</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to documents
          </button>
        </div>
      </div>
    );
  }

  if (!document || !user) return null;

  // ─── Main Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={handleBack}
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
          {isEditing ? (
            <input
              type="text"
              value={document.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 px-1 py-0.5 rounded-md hover:bg-gray-50 focus:bg-gray-50 transition-colors min-w-[200px] max-w-[400px]"
              placeholder="Untitled Document"
            />
          ) : (
            <span className="text-lg font-medium text-gray-900 px-1">
              {document.title || 'Untitled Document'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicators */}
          <div className="flex items-center gap-2">
            {/* Offline indicator */}
            {!isOnline && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Save status */}
            {saving ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Saving...</span>
              </div>
            ) : displayLastSaved ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="hidden sm:inline">Saved {displayLastSaved.toLocaleTimeString()}</span>
              </div>
            ) : null}
          </div>

          {/* Shared users avatars */}
          {document.sharedWith && document.sharedWith.length > 0 && (
            <div className="flex -space-x-2">
              {document.sharedWith.slice(0, 3).map((s: { userId: string; name: string; avatar?: string; permission: string }) => (
                <div
                  key={s.userId}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: s.avatar || '#6b7280' }}
                  title={`${s.name} (${s.permission})`}
                >
                  {s.name[0]}
                </div>
              ))}
              {document.sharedWith.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-medium">
                  +{document.sharedWith.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Share button (owner only) */}
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

          {/* Permission badge (for shared users) */}
          {!isOwner && myPermission && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              myPermission === 'edit'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {myPermission === 'edit' ? 'Can edit' : 'Can view'}
            </span>
          )}

          {/* User avatar */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: user.avatar }}
            title={`${user.name} - Click to sign out`}
          >
            {user.name[0]}
          </button>
        </div>
      </header>

      {/* ── Error Banner ──────────────────────────────────────── */}
      {error && document && (
        <div className="mx-8 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
          <button 
            onClick={() => { setError(null); clearSaveError(); }} 
            className="text-amber-500 hover:text-amber-700 ml-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── View-Only Notice ──────────────────────────────────── */}
      {!isEditing && (
        <div className="mx-8 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          This document is shared with you in view-only mode.
        </div>
      )}

      {/* ── Editor Area ───────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-8 py-8">
        <Editor
          content={document.content}
          editable={isEditing}
          onUpdate={isEditing ? handleContentUpdate : undefined}
        />
      </main>

      {/* ── Share Modal ───────────────────────────────────────── */}
      {showShareModal && (
        <ShareModal
          documentId={document.id}
          currentShares={document.sharedWith || []}
          onClose={() => {
            setShowShareModal(false);
            fetchDocument();
          }}
        />
      )}
    </div>
  );
}