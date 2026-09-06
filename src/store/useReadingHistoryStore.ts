import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReadingHistoryItem {
  mangaId: number;
  mangaTitle: string;
  mangaSlug: string;
  chapterId: number;
  chapterNumber: string | number;
  chapterTitle?: string;
  timestamp: number;
}

interface ReadingHistoryState {
  readingHistory: ReadingHistoryItem[];
  addToHistory: (item: ReadingHistoryItem) => void;
  removeFromHistory: (mangaId: number) => void;
  clearHistory: () => void;
  getLatestChapter: (mangaId: number) => ReadingHistoryItem | undefined;
}

export const useReadingHistoryStore = create<ReadingHistoryState>()(
  persist(
    (set, get) => ({
      readingHistory: [],

      addToHistory: (item) => {
        set((state) => {
          // Remove existing entry for this manga if exists
          const filtered = state.readingHistory.filter((h) => h.mangaId !== item.mangaId);

          // Add new entry to the beginning
          return {
            readingHistory: [item, ...filtered],
          };
        });
      },

      removeFromHistory: (mangaId) => {
        set((state) => ({
          readingHistory: state.readingHistory.filter((h) => h.mangaId !== mangaId),
        }));
      },

      clearHistory: () => {
        set({ readingHistory: [] });
      },

      getLatestChapter: (mangaId) => {
        return get().readingHistory.find((h) => h.mangaId === mangaId);
      },
    }),
    {
      name: 'moe_reading_history',
    }
  )
);
