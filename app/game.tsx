import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const WORD_HEIGHT = 40;
const FALL_DURATION = 10000; // 10 seconds to fall
const SPAWN_INTERVAL = 3000; // New word every 3 seconds

const WORD_LIST = [
  'REACT', 'NATIVE', 'EXPO', 'JAVASCRIPT', 'TYPESCRIPT', 'CODE', 'DEBUG',
  'FUNCTION', 'COMPONENT', 'HOOK', 'STATE', 'PROPS', 'STYLE', 'ANIMATION',
  'MOBILE', 'APP', 'DEVELOPER', 'BUILD', 'DEPLOY', 'TEST', 'ASYNC', 'AWAIT',
  'PROMISE', 'ARRAY', 'OBJECT', 'STRING', 'NUMBER', 'BOOLEAN', 'NULL',
  'RENDER', 'EFFECT', 'MEMO', 'CALLBACK', 'REF', 'CONTEXT', 'PROVIDER',
];

type FallingWord = {
  id: number;
  text: string;
  x: number;
  matched: boolean;
};

export default function WordRainGame() {
  const router = useRouter();
  const [words, setWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameAreaHeight, setGameAreaHeight] = useState(SCREEN_HEIGHT - 200);
  const nextWordId = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setMissedWords(0);
    setWords([]);
    setCurrentInput('');
    nextWordId.current = 0;

    // Focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const spawnWord = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const randomX = Math.random() * (SCREEN_WIDTH - 120) + 10;
    
    const newWord: FallingWord = {
      id: nextWordId.current++,
      text: randomWord,
      x: randomX,
      matched: false,
    };

    setWords(prev => [...prev, newWord]);
  };

  const removeWord = useCallback((wordId: number, wasMatched: boolean) => {
    setWords(prev => prev.filter(word => word.id !== wordId));
    
    if (!wasMatched) {
      setMissedWords(prev => {
        const newMissedCount = prev + 1;
        console.log(`Missed word! Count: ${newMissedCount}/3`);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        if (newMissedCount >= 3) {
          console.log('Game Over - 3 words missed!');
          setGameOver(true);
          setGameStarted(false);
          if (spawnTimerRef.current) {
            clearInterval(spawnTimerRef.current);
            spawnTimerRef.current = null;
          }
        }
        
        return newMissedCount;
      });
    }
  }, []);

  const checkMatch = (input: string) => {
    const upperInput = input.trim().toUpperCase();
    if (!upperInput) return;

    const matchedWord = words.find(
      word => !word.matched && word.text === upperInput
    );

    if (matchedWord) {
      setWords(prev =>
        prev.map(word =>
          word.id === matchedWord.id ? { ...word, matched: true } : word
        )
      );
      setScore(prev => prev + matchedWord.text.length * 10);
      setCurrentInput('');
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setTimeout(() => {
        removeWord(matchedWord.id, true);
      }, 200);
    }
  };

  useEffect(() => {
    if (gameStarted && !gameOver) {
      spawnWord();
      spawnTimerRef.current = setInterval(spawnWord, SPAWN_INTERVAL);

      return () => {
        if (spawnTimerRef.current) {
          clearInterval(spawnTimerRef.current);
        }
      };
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    checkMatch(currentInput);
  }, [currentInput]);

  useEffect(() => {
    if (gameOver) {
      // Clear all words when game ends
      setWords([]);
    }
  }, [gameOver]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ThemedView style={styles.container}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedView style={styles.statContainer}>
              <ThemedText type="defaultSemiBold">Score: {score}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statContainer}>
              <ThemedText 
                type="defaultSemiBold"
                style={[styles.missedText, missedWords >= 2 && { color: '#ff4444' }]}
              >
                Missed: {missedWords}/3
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Game Area */}
          <ThemedView 
            style={styles.gameArea}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setGameAreaHeight(height);
            }}
          >
            {words.map(word => (
              <FallingWordComponent
                key={word.id}
                word={word}
                gameAreaHeight={gameAreaHeight}
                onReachBottom={() => removeWord(word.id, false)}
                textColor={textColor}
                tintColor={tintColor}
              />
            ))}
          </ThemedView>

          {/* Input Area */}
          {gameStarted && !gameOver && (
            <ThemedView style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: textColor, borderColor: tintColor, paddingRight: currentInput ? 50 : 20 }]}
                value={currentInput}
                onChangeText={setCurrentInput}
                placeholder="Type the word..."
                placeholderTextColor={textColor + '80'}
                autoCapitalize="characters"
                autoCorrect={false}
                autoFocus
              />
              {currentInput.length > 0 && (
                <Pressable
                  style={[styles.clearButton, { backgroundColor: tintColor }]}
                  onPress={() => {
                    setCurrentInput('');
                    inputRef.current?.focus();
                  }}
                >
                  <ThemedText style={styles.clearButtonText}>×</ThemedText>
                </Pressable>
              )}
            </ThemedView>
          )}

      {/* Start/Game Over Screen */}
      {(!gameStarted || gameOver) && (
        <ThemedView style={styles.overlay}>
          <ThemedView style={[styles.menuContainer, { backgroundColor: backgroundColor }]}>
            {gameOver ? (
              <>
                <ThemedText type="title" style={styles.gameOverText}>
                  Game Over!
                </ThemedText>
                <ThemedText type="subtitle" style={styles.finalScore}>
                  Final Score: {score}
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="title" style={styles.titleText}>
                  Word Rain
                </ThemedText>
                <ThemedText style={styles.instructions}>
                  Type the falling words before they reach the bottom!
                  {'\n\n'}
                  Miss 3 words and it's game over.
                </ThemedText>
              </>
            )}
            
            <Pressable
              style={[styles.button, { backgroundColor: tintColor }]}
              onPress={startGame}
            >
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                {gameOver ? 'Play Again' : 'Start Game'}
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.button, styles.backButton]}
              onPress={() => router.back()}
            >
              <ThemedText type="link">Back to Home</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      )}
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FallingWordComponent({
  word,
  gameAreaHeight,
  onReachBottom,
  textColor,
  tintColor,
}: {
  word: FallingWord;
  gameAreaHeight: number;
  onReachBottom: () => void;
  textColor: string;
  tintColor: string;
}) {
  const translateY = useSharedValue(-WORD_HEIGHT);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasReachedBottom = useSharedValue(false);

  useEffect(() => {
    hasReachedBottom.value = false;
    
    if (!word.matched) {
      translateY.value = withTiming(
        gameAreaHeight - WORD_HEIGHT,
        {
          duration: FALL_DURATION,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished && !hasReachedBottom.value) {
            hasReachedBottom.value = true;
            runOnJS(onReachBottom)();
          }
        }
      );
    }

    return () => {
      cancelAnimation(translateY);
    };
  }, [word.id, word.matched, gameAreaHeight]);

  useEffect(() => {
    if (word.matched) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [word.matched]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.wordContainer,
        {
          left: word.x,
          backgroundColor: word.matched ? tintColor : tintColor + '40',
          borderColor: tintColor,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="defaultSemiBold"
        style={[styles.wordText, { color: word.matched ? '#fff' : textColor }]}
      >
        {word.text}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    // paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  statContainer: {
    backgroundColor: 'transparent',
  },
  missedText: {
    fontSize: 16,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    backgroundColor:'red'
  },
  keyboardView: {
    backgroundColor: 'transparent',
  },
  wordContainer: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  menuContainer: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  titleText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  gameOverText: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#ff4444',
  },
  finalScore: {
    marginBottom: 30,
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
