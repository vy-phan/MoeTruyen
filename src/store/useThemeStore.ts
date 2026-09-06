import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 
  | 'light'
  | 'night'
  | 'corporate'
  | 'pastel'
  | 'lofi'
  | 'forest'
  | 'winter'
  | 'nord'
  | 'valentine';

export interface ThemeOption {
  id: ThemeId;
  name: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'light', name: '☀️ Light' },
  { id: 'night', name: '🌙 Night' },
  { id: 'corporate', name: '💼 Corporate' },
  { id: 'pastel', name: '🎨 Pastel' },
  { id: 'lofi', name: '☕ Lofi' },
  { id: 'forest', name: '🌲 Forest' },
  { id: 'winter', name: '❄️ Winter' },
  { id: 'nord', name: '🏔️ Nord' },
  { id: 'valentine', name: '💖 Valentine' },
];

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'night',
      setTheme: (theme) => {
        // Cập nhật ngay attribute data-theme trên thẻ <html>
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'moe_theme_storage', // Key lưu ở localStorage
      onRehydrateStorage: () => (state) => {
        // Áp dụng theme ngay khi app khôi phục state từ localStorage
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      },
    }
  )
);