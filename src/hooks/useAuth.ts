import { useAuthenticationStatus, useUserData, useSignOut } from '@nhost/react';
import { useEffect, useState } from 'react';
import type { AuthState } from '../types';

export function useAuth(): AuthState & { signOut: () => void } {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const userData = useUserData();
  const { signOut } = useSignOut();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
    }
  }, [authLoading]);

  return {
    user: userData ? {
      id: userData.id,
      email: userData.email || '',
      displayName: userData.displayName || userData.email?.split('@')[0] || 'User',
      avatarUrl: userData.avatarUrl || undefined,
    } : null,
    isLoading,
    isAuthenticated: isAuthenticated || false,
    signOut,
  };
}