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
  resetPassword: (username: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
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

  const resetPassword = useCallback(async (username: string, password: string) => {
    const normalizedUsername = username.toLowerCase();
    const existingUsers = loadUsers();
    const existingUser = existingUsers.find(user => user.username.toLowerCase() === normalizedUsername);

    if (!existingUser) {
      return false;
    }

    const hash = await hashPassword(password);
    const updatedUser: AppUser = {
      ...existingUser,
      passwordHash: hash,
    };
    const updated = existingUsers.map(user => (
      user.username.toLowerCase() === normalizedUsername ? updatedUser : user
    ));

    saveUsers(updated);
    setUsers(updated);

    setCurrentUser(prev => (
      prev && prev.username.toLowerCase() === normalizedUsername ? updatedUser : prev
    ));

    return true;
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return false;
    }

    const currentHash = await hashPassword(currentPassword);
    if (currentUser.passwordHash !== currentHash) {
      return false;
    }

    const newHash = await hashPassword(newPassword);
    const updatedUser: AppUser = {
      ...currentUser,
      passwordHash: newHash,
    };
    const updated = loadUsers().map(user => (
      user.username.toLowerCase() === currentUser.username.toLowerCase() ? updatedUser : user
    ));

    saveUsers(updated);
    setUsers(updated);
    setCurrentUser(updatedUser);

    return true;
  }, [currentUser]);

  const removeUser = useCallback((username: string) => {
    const updated = loadUsers().filter(u => u.username.toLowerCase() !== username.toLowerCase());
    saveUsers(updated);
    setUsers(updated);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, users, login, logout, addUser, resetPassword, changePassword, removeUser,
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
