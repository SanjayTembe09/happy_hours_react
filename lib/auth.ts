import { User, AuthState } from '@/types';

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  getState(): AuthState {
    return this.authState;
  }

  async login(email: string, password: string): Promise<void> {
    this.authState = { ...this.authState, isLoading: true, error: null };
    this.notify();

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on email
      let user: User;
      if (email.includes('admin')) {
        user = {
          id: '1',
          email,
          name: 'Admin User',
          role: 'admin',
        };
      } else if (email.includes('business')) {
        user = {
          id: '2',
          email,
          name: 'Business Owner',
          role: 'business',
          businessId: 'business-1',
        };
      } else {
        user = {
          id: '3',
          email,
          name: 'Customer',
          role: 'customer',
        };
      }

      this.authState = {
        user,
        token: 'mock-jwt-token',
        isLoading: false,
        error: null,
      };
    } catch (error) {
      this.authState = {
        ...this.authState,
        isLoading: false,
        error: 'Login failed',
      };
    }
    this.notify();
  }

  async logout(): Promise<void> {
    this.authState = {
      user: null,
      token: null,
      isLoading: false,
      error: null,
    };
    this.notify();
  }

  isAdmin(): boolean {
    return this.authState.user?.role === 'admin';
  }

  isBusiness(): boolean {
    return this.authState.user?.role === 'business';
  }
}

export const authService = AuthService.getInstance();