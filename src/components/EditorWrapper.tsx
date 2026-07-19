'use client';

// Now it is safe to import here, because this file will ONLY load in the browser
import { useYjsProvider } from '@/hooks/useYjsProvider';
// ... your editor component code goes here

export default function EditorWrapper({ documentId, user }) {
  const { ydoc, provider, connected } = useYjsProvider(documentId, user);
  // ... return your editor
}