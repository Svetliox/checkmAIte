import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export type ChessTheme = 'ORIGINAL' | 'MODERN';

export interface ChessThemeColors {
  lightSquare: string;
  darkSquare: string;
}

const THEME_COLORS: Record<ChessTheme, ChessThemeColors> = {
  MODERN: {
    lightSquare: '#e8eaed',
    darkSquare: '#769656',
  },
  ORIGINAL: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
  },
};

export function useChessTheme() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<ChessTheme>('ORIGINAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTheme() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/theme');
        const data = await response.json();
        if (data.theme) {
          setTheme(data.theme);
        }
      } catch (error) {
        console.error('Failed to fetch chess theme:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTheme();
  }, [session?.user]);

  return {
    theme,
    colors: THEME_COLORS[theme],
    loading,
  };
}
