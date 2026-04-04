import { createContext, useContext } from 'react';

export interface AuthState {
  user: any | null;
  token: string | null;
  isVendorMode: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
  toggleVendorMode: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null, token: null, isVendorMode: false, login: () => {}, logout: () => {}, toggleVendorMode: () => {},
});

export function useAuth() { return useContext(AuthContext); }
