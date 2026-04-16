import { createContext, useState, useCallback, type ReactNode } from "react";
import type { User, Role, DefectStatus } from "../data/entities";
import { getAll } from "../data/store";
import {
  hasPermission as checkPermission,
  type PermissionKey,
} from "../utils/permissions";

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  fullName: string;
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (action: PermissionKey, context?: DefectStatus) => boolean;
}

const SESSION_KEY = "tqh_current_user";

function loadSessionUser(): AuthUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw === null) return null;
  return JSON.parse(raw) as AuthUser;
}

function saveSessionUser(user: AuthUser | null): void {
  if (user === null) {
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(loadSessionUser);

  const login = useCallback((username: string, password: string): boolean => {
    const users = getAll<User>("tqh_users");
    const found = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (!found) return false;

    const authUser: AuthUser = {
      id: found.id,
      username: found.username,
      role: found.role,
      fullName: found.fullName,
      email: found.email,
    };
    saveSessionUser(authUser);
    setUser(authUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    saveSessionUser(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (action: PermissionKey, context?: DefectStatus): boolean => {
      if (!user) return false;
      return checkPermission(user.role, action, context);
    },
    [user],
  );

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
