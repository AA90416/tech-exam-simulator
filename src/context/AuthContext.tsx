import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface AppUser {
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (username: string, password: string, role: 'admin' | 'user') => Promise<AppUser>;
  removeUser: (username: string) => void;
  isAuthenticated: boolean;
}

const USERS_KEY = 'exam-simulator-users';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'exam-sim-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers(): AppUser[] {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const hash = await hashPassword(password);
    const allUsers = loadUsers();
    const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === hash);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const addUser = useCallback(async (username: string, password: string, role: 'admin' | 'user') => {
    const hash = await hashPassword(password);
    const newUser: AppUser = { username, passwordHash: hash, role };
    const existingUsers = loadUsers();
    const updated = [...existingUsers.filter(u => u.username.toLowerCase() !== username.toLowerCase()), newUser];
    saveUsers(updated);
    setUsers(updated);
    return newUser;
  }, []);

  const removeUser = useCallback((username: string) => {
    const updated = loadUsers().filter(u => u.username.toLowerCase() !== username.toLowerCase());
    saveUsers(updated);
    setUsers(updated);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, users, login, logout, addUser, removeUser,
      isAuthenticated: currentUser !== null,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
