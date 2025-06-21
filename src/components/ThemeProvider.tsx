import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from "@/components/ThemeProvider";

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ThemeContext.Provider value={{ theme: 'light', setTheme: () => {} }}>{children}</ThemeContext.Provider>
  }
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Get saved theme from localStorage
    const savedTheme = typeof window !== "undefined" && typeof window !== "undefined" && typeof window !== "undefined" && localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    if (typeof window === "undefined") return;
    // Listen for system theme changes
    const mediaQuery = typeof window !== "undefined" && typeof window !== "undefined" && typeof window !== "undefined" && window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const root = typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && typeof document !== "undefined" && document.documentElement;

    let resolvedTheme: 'light' | 'dark';
    if (newTheme === 'system') {
      resolvedTheme = typeof window !== "undefined" && typeof window !== "undefined" && typeof window !== "undefined" && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolvedTheme = newTheme;
    }

    root.classList.toggle('dark', resolvedTheme === 'dark');
    setActualTheme(resolvedTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};