'use client';

import { useState } from 'react';
import { DocumentShare } from '@/types/document';

// All available users (matches seed data)
const ALL_USERS = [
  { id: 'alice', email: 'alice@ajaia.test', name: 'Alice Johnson', avatar: '#4F46E5' },
  { id: 'bob', email: 'bob@ajaia.test', name: 'Bob Smith', avatar: '#059669' },
  { id: 'carol', email: 'carol@ajaia.test', name: 'Carol Davis', avatar: '#DC2626' },
];

interface ShareModalProps {
  documentId: string;
  currentShares: DocumentShare[];
  onClose: () => void;
}

export default function ShareModal({ documentId, currentShares, onClose }: ShareModalProps) {
  const [shares, setShares] = useState<DocumentShare[]>(currentShares);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Users not yet shared with
  const availableUsers = ALL_USERS.filter(
    (u) => !shares.some((s) => s.email === u.email)
  );

  const handleShare = async (user: typeof ALL_USERS[0], permission: 'view' | 'edit') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          userEmail: user.email,
          permission,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to share');
      }
      setShares([
        ...shares,
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          permission,
        },
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, userEmail }),
      });
      if (!res.ok) throw new Error('Failed to remove');
      setShares(shares.filter((s) => s.email !== userEmail));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (userEmail: string, permission: 'view' | 'edit') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, userEmail, permission }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setShares(shares.map((s) => (s.email === userEmail ? { ...s, permission } : s)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/editor/${documentId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Share Document</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Copy link */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-gray-500 truncate">{window.location.origin}/editor/{documentId}</span>
            </div>
            <button
              onClick={copyLink}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Current shares */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            People with access ({shares.length})
          </h3>
          {shares.length > 0 ? (
            <div className="space-y-2">
              {shares.map((share) => (
                <div key={share.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                    style={{ backgroundColor: share.avatar || '#6b7280' }}
                  >
                    {share.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{share.name}</div>
                    <div className="text-xs text-gray-500 truncate">{share.email}</div>
                  </div>
                  <select
                    value={share.permission}
                    onChange={(e) => handleUpdatePermission(share.email, e.target.value as 'view' | 'edit')}
                    disabled={loading}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-white"
                  >
                    <option value="view">Can view</option>
                    <option value="edit">Can edit</option>
                  </select>
                  <button
                    onClick={() => handleRemoveShare(share.email)}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove access"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No one has access yet.</p>
          )}
        </div>

        {/* Add people */}
        {availableUsers.length > 0 && (
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add people</h3>
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                    style={{ backgroundColor: user.avatar }}
                  >
                    {user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShare(user, 'view')}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleShare(user, 'edit')}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Sharing uses test accounts. In production, this would use real user invitations.
          </p>
        </div>
      </div>
    </div>
  );
}