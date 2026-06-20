'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const USERS = [
  { id: 'alice', email: 'alice@ajaia.test', name: 'Alice Johnson', avatar: '#4F46E5', role: 'Product Manager' },
  { id: 'bob', email: 'bob@ajaia.test', name: 'Bob Smith', avatar: '#059669', role: 'Engineer' },
  { id: 'carol', email: 'carol@ajaia.test', name: 'Carol Davis', avatar: '#DC2626', role: 'Designer' },
];

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-2xl font-bold mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ajaia Docs</h1>
          <p className="text-gray-500 mt-1">Lightweight collaborative document editor</p>
        </div>

        {/* User Selection Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">
            Select a test account to continue. This simulates authentication for the assignment.
          </p>

          <div className="space-y-3">
            {USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => login(u)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left"
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shrink-0"
                  style={{ backgroundColor: u.avatar }}
                >
                  {u.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {u.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">{u.email}</div>
                </div>

                {/* Role badge */}
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">
                  {u.role}
                </span>

                {/* Arrow */}
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Assignment by Shabie Ul Hassan · Mock auth for demo purposes
        </p>
      </div>
    </div>
  );
}