import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Settings {
  openaiApiKey: string;
  defaultQuestionCount: number;
  defaultDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isApiKeySet: boolean;
}

const defaultSettings: Settings = {
  openaiApiKey: '',
  defaultQuestionCount: 10,
  defaultDifficulty: 'intermediate',
};

const STORAGE_KEY = 'exam-simulator-settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const isApiKeySet = settings.openaiApiKey.length > 0;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isApiKeySet }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
