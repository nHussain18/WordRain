
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  HIGH_SCORE: 'highScore',
  GAMES_PLAYED: 'gamesPlayed',
};

export const getHighScore = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.HIGH_SCORE);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

export const setHighScore = async (score: number): Promise<void> => {
  try {
    const currentHighScore = await getHighScore();
    if (score > currentHighScore) {
      await AsyncStorage.setItem(KEYS.HIGH_SCORE, score.toString());
    }
  } catch (error) {
    console.error('Error setting high score:', error);
  }
};

export const getGamesPlayed = async (): Promise<number> => {
  try {
    const value = await AsyncStorage.getItem(KEYS.GAMES_PLAYED);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.error('Error getting games played:', error);
    return 0;
  }
};

export const incrementGamesPlayed = async (): Promise<number> => {
  try {
    const current = await getGamesPlayed();
    const newCount = current + 1;
    await AsyncStorage.setItem(KEYS.GAMES_PLAYED, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing games played:', error);
    return 0;
  }
};

// Reset all stats (optional utility)
export const resetStats = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([KEYS.HIGH_SCORE, KEYS.GAMES_PLAYED]);
  } catch (error) {
    console.error('Error resetting stats:', error);
  }
};
