'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { parseFileToTipTap, validateFile } from '@/lib/fileParser';
import { api } from '@/lib/api'; 

export default function FileUploadButton() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset input so same file can be re-uploaded
    e.target.value = '';

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 4000);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Read file content
      const text = await file.text();
      
      // Parse to TipTap format
      const { json, title } = parseFileToTipTap(text, file.name);

      // ✅ Use the API client (and use user.id, not user.email!)
      const doc = await api.createDocument({
        userId: user.id, 
        title: title,
        content: JSON.stringify(json), // ✅ Pass the parsed content
      });

      router.push(`/editor/${doc.id}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process file. Please try again.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-full left-0 mt-2 z-20 w-72 p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm text-sm text-red-700 animate-in fade-in">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {uploading ? 'Importing...' : 'Import File'}
      </button>
      
      <span className="ml-2 text-xs text-gray-400 hidden sm:inline">(.txt, .md)</span>
    </div>
  );
}