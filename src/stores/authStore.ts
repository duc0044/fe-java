import { create } from 'zustand';
import Cookies from 'js-cookie';

export interface UserProfile {
  id?: number;
  email: string;
  username: string;
  roles?: string | string[];
  permissions?: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUserProfile: (profile: UserProfile) => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  userProfile: null,
  isAuthenticated: false,

  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'Strict' });
    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'Strict' });
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUserProfile: (profile: UserProfile) => {
    set({ userProfile: profile });
  },

  getAccessToken: () => {
    return get().accessToken || Cookies.get('accessToken') || null;
  },

  getRefreshToken: () => {
    return get().refreshToken || Cookies.get('refreshToken') || null;
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ accessToken: null, refreshToken: null, userProfile: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken, isAuthenticated: true });
    }
  },
}));
