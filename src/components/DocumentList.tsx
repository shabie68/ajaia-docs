'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DocumentsResponse } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

export default function DocumentList() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'shared'>('owned');
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      // ✅ The api client already parses the JSON and checks for errors!
      const data = await api.getDocuments(user.id);
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Could not load documents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      // ✅ Use the api client for creating too
      const doc = await api.createDocument({ 
        userId: user.id, // Make sure to use .id now!
        title: 'Untitled Document' 
      });
      router.push(`/editor/${doc.id}`);
    } catch (err: any) {
      setError(err.message || 'Could not create document.');
      console.error(err);
    }
  };

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      // ✅ Use the api client for deleting
      await api.deleteDocument(docId);
      fetchDocuments(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Could not delete document.');
      console.error(err);
    }
  };

  const handleOpen = (docId: string) => {
    router.push(`/editor/${docId}`);
  };

  if (loading && !documents) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const currentList = activeTab === 'owned' ? documents?.owned : documents?.shared;
  const ownedCount = documents?.owned.length || 0;
  const sharedCount = documents?.shared.length || 0;

  return (
    <div>
      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('owned')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'owned'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Documents
          {ownedCount > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {ownedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'shared'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Shared with me
          {sharedCount > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {sharedCount}
            </span>
          )}
        </button>
      </div>

      {/* Document list */}
      {currentList && currentList.length > 0 ? (
        <div className="space-y-2">
          {currentList.map((doc: any) => (
            <div
              key={doc.id}
              onClick={() => handleOpen(doc.id)}
              className="group flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all"
            >
              {/* Document icon */}
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                  {doc.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {activeTab === 'shared' ? `Shared by ${doc.owner.name} · ` : ''}
                  Edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  {doc.sharedWith && doc.sharedWith.length > 0 && activeTab === 'owned' && (
                    <span> · Shared with {doc.sharedWith.length}</span>
                  )}
                </div>
              </div>

              {/* Permission badge (shared docs) */}
              {activeTab === 'shared' && doc.permission && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                  doc.permission === 'edit'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {doc.permission === 'edit' ? 'Can edit' : 'Can view'}
                </span>
              )}

              {/* Delete button (only for owned docs) */}
              {activeTab === 'owned' && (
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  title="Delete document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Open arrow */}
              <svg
                className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">
            {activeTab === 'owned' ? 'No documents yet' : 'No shared documents'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {activeTab === 'owned' ? 'Create your first document to get started.' : 'When someone shares a document with you, it will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}