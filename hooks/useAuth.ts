import { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { AuthState } from '@/types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isBusiness: authService.isBusiness.bind(authService),
  };
}