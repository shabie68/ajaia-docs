'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import DocumentList from '@/components/DocumentList';
import FileUploadButton from '@/components/FileUploadButton';
import { useCreateDocument } from '@/hooks/useCreateDocument';
import { signOut } from 'next-auth/react';

const DEFAULT_DOC_TITLE = 'Untitled Document';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { create, creating } = useCreateDocument();

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Keyboard shortcut
  const handleCreate = useCallback(() => {
    if (user) create(user.id);
  }, [user, create]);

  // Change the handleLogout function:
  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCreate]);

  // const handleLogout = () => {
  //   logout();
  //   router.push('/login');
  // };

  if (isLoading || !user) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <PageHeader creating={creating} onCreate={handleCreate} />
        <SearchBar value={search} onChange={setSearch} />
        <DocumentList search={search} />
      </main>
    </div>
  );
}

// Extracted sub-components (same file or separate)
function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
}

function Header({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left Side: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
          A
        </div>
        <span className="font-semibold text-gray-900">Ajaia Docs</span>
      </div>

      {/* Right Side: Avatar & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user.avatar || '#6b7280' }}
          >
            {user.name[0]}
          </div>
          <span className="text-sm text-gray-700 hidden sm:inline">{user.name}</span>
        </div>
        
        {/* ✅ HERE IS THE LOGOUT BUTTON */}
        <button
          onClick={onLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function PageHeader({ creating, onCreate }: { creating: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-0.5">Create, import, and manage your documents</p>
      </div>
      <div className="flex items-center gap-3">
        <FileUploadButton />
        <button
          onClick={onCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {creating ? 'Creating...' : 'New Document'}
        </button>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search documents... (⌘K)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}