import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GameStats {
  highScore: number;
  totalWordsMatched: number;
  totalWordsSpawned: number;
  gamesPlayed: number;
  accuracy: number;
}

interface GameStore extends GameStats {
  wordsMatchedCount: number;
  currentGameWordsSpawned: number;
  
  // Actions
  updateHighScore: (score: number) => void;
  incrementGamesPlayed: () => void;
  addWordMatched: () => void;
  addWordSpawned: () => void;
  resetCurrentGame: () => void;
  calculateAccuracy: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Persisted stats
      highScore: 0,
      totalWordsMatched: 0,
      totalWordsSpawned: 0,
      gamesPlayed: 0,
      accuracy: 0,
      
      // Current game session (not persisted)
      wordsMatchedCount: 0,
      currentGameWordsSpawned: 0,
      
      updateHighScore: (score: number) => {
        const currentHighScore = get().highScore;
        if (score > currentHighScore) {
          set({ highScore: score });
        }
      },
      
      incrementGamesPlayed: () => {
        set((state) => ({ gamesPlayed: state.gamesPlayed + 1 }));
      },
      
      addWordMatched: () => {
        set((state) => ({
          wordsMatchedCount: state.wordsMatchedCount + 1,
          totalWordsMatched: state.totalWordsMatched + 1,
        }));
        get().calculateAccuracy();
      },
      
      addWordSpawned: () => {
        set((state) => ({
          currentGameWordsSpawned: state.currentGameWordsSpawned + 1,
          totalWordsSpawned: state.totalWordsSpawned + 1,
        }));
        get().calculateAccuracy();
      },
      
      resetCurrentGame: () => {
        set({
          wordsMatchedCount: 0,
          currentGameWordsSpawned: 0,
        });
      },
      
      calculateAccuracy: () => {
        const { totalWordsMatched, totalWordsSpawned } = get();
        if (totalWordsSpawned > 0) {
          const accuracy = Math.round((totalWordsMatched / totalWordsSpawned) * 100);
          set({ accuracy });
        }
      },
    }),
    {
      name: 'wordrain-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        highScore: state.highScore,
        totalWordsMatched: state.totalWordsMatched,
        totalWordsSpawned: state.totalWordsSpawned,
        gamesPlayed: state.gamesPlayed,
        accuracy: state.accuracy,
      }),
    }
  )
);
