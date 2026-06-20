// lib/auth.ts
// Simple mock auth - in production this would be real auth
// For this assignment, we simulate login by selecting a seeded user

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

// This would be replaced by real auth (NextAuth, Clerk, etc.)
// For now, we store selected user in memory/localStorage
export const SEEDED_USERS = [
  { id: 'alice', email: 'alice@ajaia.test', name: 'Alice Johnson', avatar: '#4F46E5' },
  { id: 'bob', email: 'bob@ajaia.test', name: 'Bob Smith', avatar: '#059669' },
  { id: 'carol', email: 'carol@ajaia.test', name: 'Carol Davis', avatar: '#DC2626' },
];

// In API routes, we'll pass userId as header from client
// This is intentionally simple for the assignment scope