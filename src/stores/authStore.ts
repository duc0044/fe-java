import { create } from 'zustand';

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
  isInitialized: boolean;  // Track if auth initialization is complete

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
  isInitialized: false,

  setTokens: (accessToken: string, refreshToken: string) => {
    // Use localStorage instead of secure cookies to persist across page reloads
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUserProfile: (profile: UserProfile) => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    set({ userProfile: profile });
  },

  getAccessToken: () => {
    return get().accessToken || localStorage.getItem('accessToken') || null;
  },

  getRefreshToken: () => {
    return get().refreshToken || localStorage.getItem('refreshToken') || null;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    set({ accessToken: null, refreshToken: null, userProfile: null, isAuthenticated: false, isInitialized: true });
  },

  initializeAuth: () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userProfile = localStorage.getItem('userProfile');

    if (accessToken && refreshToken) {
      set({
        accessToken,
        refreshToken,
        userProfile: userProfile ? JSON.parse(userProfile) : null,
        isAuthenticated: true,
        isInitialized: true
      });
    } else {
      set({ isInitialized: true });
    }
  },
}));
