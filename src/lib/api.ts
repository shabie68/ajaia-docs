// src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers, // ✅ Safely merges headers if you ever need to pass custom ones
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Documents
  getDocuments: (userId: string) => 
    request<any>(`/documents?userId=${userId}`),
    
  getDocument: (id: string, userId: string) => 
    request<any>(`/documents/${id}?userId=${userId}`),
    
    // ✅ Add content?: string to the type
    createDocument: (data: { userId: string; title: string; content?: string }) => 
        request<any>('/documents', {
        method: 'POST',
        body: JSON.stringify(data),
        }),
    
  updateDocument: (id: string, data: { title?: string; content?: string }) => 
    request<any>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    
  deleteDocument: (id: string) => 
    request<any>(`/documents/${id}`, {
      method: 'DELETE',
    }),

      // Shares
  shareDocument: (documentId: string, userEmail: string, permission: string) => 
    request<any>('/documents/share', {
      method: 'POST',
      body: JSON.stringify({ documentId, userEmail, permission }),
    }),
    
  removeShare: (documentId: string, userEmail: string) => 
    request<any>('/documents/share', {
      method: 'DELETE',
      body: JSON.stringify({ documentId, userEmail }),
    }),
    
  updateSharePermission: (documentId: string, userEmail: string, permission: string) => 
    request<any>('/documents/share', {
      method: 'PATCH',
      body: JSON.stringify({ documentId, userEmail, permission }),
    }),
};

