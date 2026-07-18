'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give it a brief moment to check session on mount
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  const logout = async () => {
    // We will import signOut from next-auth/react in the components that need it
    // For the context, we just trigger a redirect
    window.location.href = '/api/auth/signout';
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.name!,
              avatar: session.user.avatar,
            }
          : null,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);