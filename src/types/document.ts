export interface DocumentUser {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface DocumentShare {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  permission: 'view' | 'edit';
}

export interface Document {
  id: string;
  title: string;
  content: string; // JSON string of TipTap content
  createdAt: string;
  updatedAt: string;
  owner: DocumentUser;
  sharedWith?: DocumentShare[];
  permission?: 'view' | 'edit'; // For shared docs - what access current user has
}

export interface DocumentsResponse {
  owned: Document[];
  shared: Document[];
}