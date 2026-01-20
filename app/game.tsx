import Textc from '@/components/Textc';
import { Colors } from '@/constants/theme';
import { useGameStore } from '@/store/game-store';
import { BlurMask, Canvas, Circle, Group, RoundedRect, LinearGradient as SkiaLinearGradient, Text as SkiaText, matchFont, vec } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const WORD_HEIGHT = 40;
const FALL_DURATION = 6000; // 6 seconds to fall
const SPAWN_INTERVAL = 2000; // New word every 2 seconds

const WORD_LIST = [
  "HELLO", "HEY", "YESSS", "OKAY", "PLEASE", "THANKS", "SORRY", "WELCOME", "GOODBYE", "GOOD", "GREAT", "FINE", "COOL", "NICE", "SURE", "WAIT", "STOP", "COME", "START", "DONE", "AGAIN", "LATER", "NOW", "TODAY", "TOMORROW", "YESTERDAY", "MORNING", "EVENING", "NIGHT", "HOME", "WORK", "OFFICE", "SCHOOL", "FRIEND", "FAMILY", "PEOPLE", "LOVE", "LIKE", "NEED", "WANT", "HELP", "CALL", "MESSAGE", "MEET", "TALK", "SPEAK", "LISTEN", "SEE",

  "EAT", "DRINK", "SLEEP", "WALK", "RUN", "SIT", "STAND", "TRAVEL", "DRIVE", "MONEY", "TIME", "BUSY", "FREE", "READY", "SAFE", "HAPPY", "SAD", "ANGRY", "EXCITED", "TIRED", "BORED", "CALM", "RELAX", "STRESS", "WORRY", "TRUST", "CARE", "SHARE", "SMILE", "LAUGH", "CRY", "THINK", "KNOW", "BELIEVE", "REMEMBER", "FORGET", "UNDERSTAND", "EXPLAIN", "LEARN", "TEACH", "STUDY", "PRACTICE", "TRY", "FAIL", "WIN", "LOSE", "CHANGE", "FIX", "BUILD",

  "OPEN", "CLOSE", "ENTER", "EXIT", "BUY", "SELL", "PAY", "SEND", "RECEIVE", "ORDER", "CANCEL", "BOOK", "PLAN", "DECIDE", "AGREE", "REJECT", "ACCEPT", "CONFIRM", "CHECK", "UPDATE", "DELETE", "SAVE", "LOAD", "LOGIN", "LOGOUT", "SEARCH", "FIND", "SHOW", "HIDE", "CLICK", "PRESS", "HOLD", "RELEASE", "SCROLL", "TYPE", "READ", "WRITE", "WATCH", "HEAR", "PLAY", "PAUSE", "RECORD", "POST", "COMMENT", "REPLY", "FOLLOW", "BLOCK", "REPORT",

  "PHONE", "MOBILE", "DEVICE", "SCREEN", "APPLICATION", "WEBSITE", "INTERNET", "ONLINE", "OFFLINE", "WIFI", "NETWORK", "PASSWORD", "EMAIL", "ACCOUNT", "PROFILE", "SETTINGS", "NOTIFICATION", "MESSAGEBOX", "CHAT", "GROUP", "CONTACT", "NUMBER", "ADDRESS", "LOCATION", "MAP", "PLACE", "CITY", "COUNTRY", "ROAD", "TRAFFIC", "WEATHER", "RAIN", "SUNNY", "CLOUDY", "HEAT", "COLD", "FOOD", "WATER", "TEA", "COFFEE", "BREAKFAST", "LUNCH", "DINNER", "SNACK", "REST", "HEALTH", "DOCTOR", "MEDICINE", "EMERGENCY"
];


type FallingWord = {
  id: number;
  text: string;
  x: number;
  y: number;
  matched: boolean;
  matchedTime?: number;
  spawnTime: number;
  fallDuration: number;
  reachedBottom?: boolean;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

const WordRainGame = () => {
  const router = useRouter();
  const {
    highScore,
    updateHighScore,
    incrementGamesPlayed,
    addWordMatched,
    addWordSpawned,
    resetCurrentGame,
    wordsMatchedCount
  } = useGameStore();

  const [words, setWords] = useState<FallingWord[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [score, setScore] = useState(0);
  const [missedWords, setMissedWords] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  // const [countdown, setCountdown] = useState(3);
  // const [showCountdown, setShowCountdown] = useState(true);
  const [gameAreaHeight, setGameAreaHeight] = useState(SCREEN_HEIGHT - 200);
  const nextWordId = useRef(0);
  const nextParticleId = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const inputRef = useRef<TextInput>(null);
  const timeRef = useRef(Date.now());
  const INSETS = useSafeAreaInsets();

  const font = matchFont({
    fontFamily: Platform.select({ ios: 'Helvetica', android: 'sans-serif', default: 'sans-serif' }),
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: 'bold',
  });

  const startGame = () => {
    setGameStarted(true); // Start immediately
    setGameOver(false);
    setScore(0);
    setIsNewHighScore(false);
    setMissedWords(0);
    setWords([]);
    setParticles([]);
    setCurrentInput('');
    // setShowCountdown(true);
    // setCountdown(3);
    nextWordId.current = 0;
    nextParticleId.current = 0;
    timeRef.current = Date.now();

    // Reset current game stats and increment games played
    resetCurrentGame();
    incrementGamesPlayed();

    // Focus input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Countdown effect on mount and when restarting
  // useEffect(() => {
  //   if (showCountdown && countdown > 0) {
  //     const timer = setTimeout(() => {
  //       setCountdown(countdown - 1);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   } else if (showCountdown && countdown === 0) {
  //     setShowCountdown(false);
  //     setGameStarted(true); // Only start game after countdown
  //   }
  // }, [countdown, showCountdown]);

  // Stats are now loaded automatically by Zustand persist middleware

  // Auto-start game on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startGame();
    }, 400); // Wait for navigation transition to complete

    return () => clearTimeout(timer);
  }, []);

  const spawnWord = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    const wordWidth = randomWord.length * 14 + 32;
    const randomX = Math.random() * (SCREEN_WIDTH - wordWidth - 20) + 10;

    const newWord: FallingWord = {
      id: nextWordId.current++,
      text: randomWord,
      x: randomX,
      y: -WORD_HEIGHT,
      matched: false,
      spawnTime: Date.now(),
      fallDuration: FALL_DURATION + Math.random() * 3000, //[6s - 9s]
    };

    addWordSpawned();
    setWords(prev => [...prev, newWord]);
  }, [addWordSpawned]);

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

  const createParticles = (x: number, y: number, particleCount: number) => {
    const newParticles: Particle[] = [];
    const colors = [Colors.cyan, Colors.purple, Colors.gold, Colors.aqua, Colors.orange];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 3;

      newParticles.push({
        id: nextParticleId.current++,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  const checkMatch = (input: string) => {
    const upperInput = input.trim().toUpperCase();
    if (!upperInput) return;

    const matchedWord = words.find(
      word => !word.matched && word.text === upperInput
    );

    if (matchedWord) {
      // Calculate current word position based on elapsed time
      const now = timeRef.current;
      const elapsedTime = now - matchedWord.spawnTime;
      const progress = Math.min(elapsedTime / matchedWord.fallDuration, 1);
      const currentY = Math.max(-WORD_HEIGHT, progress * (gameAreaHeight - WORD_HEIGHT));

      // Create particle explosion at word's current position
      createParticles(matchedWord.x + 50, currentY + 20, matchedWord.text?.length * 4);

      // Store the current Y position in the matched word so it freezes there
      setWords(prev =>
        prev.map(word =>
          word.id === matchedWord.id ? { ...word, matched: true, matchedTime: Date.now(), y: currentY } : word
        )
      );
      setScore(prev => prev + matchedWord.text.length * 10);
      setCurrentInput('');
      addWordMatched();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setTimeout(() => {
        removeWord(matchedWord.id, true);
      }, 200);
    }
  };

  // Spawn word logic - only runs when game starts/stops
  useEffect(() => {
    if (gameStarted && !gameOver) {
      spawnWord();
      spawnTimerRef.current = setInterval(spawnWord, SPAWN_INTERVAL);
      // const spawnWordsWithRandomInterval = () => {
      //   const interval = SPAWN_INTERVAL + Math.random() * SPAWN_INTERVAL;
      //   spawnTimerRef.current = setTimeout(() => {
      //     spawnWord();
      //     spawnWordsWithRandomInterval();
      //   }, interval);
      // };

      // spawnWordsWithRandomInterval();

      return () => {
        if (spawnTimerRef.current) {
          clearInterval(spawnTimerRef.current);
          // clearTimeout(spawnTimerRef.current);
          spawnTimerRef.current = null;
        }
      };
    }
  }, [gameStarted, gameOver, spawnWord]);

  // Animation loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const animate = () => {
        timeRef.current = Date.now();

        // Update particles
        setParticles(prevParticles => {
          return prevParticles
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vy: particle.vy + 0.3,
              life: particle.life - 0.02,
            }))
            .filter(particle => particle.life > 0);
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [gameStarted, gameOver]);

  // Check words that reached bottom
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const checkInterval = setInterval(() => {
        const now = Date.now();
        setWords(prevWords => {
          const filtered = prevWords.filter(word => {
            if (word.matched || word.reachedBottom) return true;

            const elapsedTime = now - word.spawnTime;
            const progress = elapsedTime / word.fallDuration;

            if (progress >= 1) {
              removeWord(word.id, false);
              return false;
            }
            return true;
          });
          return filtered;
        });
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [gameStarted, gameOver, removeWord]);

  useEffect(() => {
    checkMatch(currentInput);
  }, [currentInput]);

  useEffect(() => {
    if (gameOver) {
      // Clear all words and particles when game ends
      setWords([]);
      setParticles([]);

      // Check and update high score
      if (score > highScore) {
        updateHighScore(score);
        setIsNewHighScore(true);
      }
    }
  }, [gameOver, score, highScore, updateHighScore]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.floatingContainer, { top: INSETS.top }]}>
        <View style={styles.scoreView}>
          <Textc semiBold size={11} color={Colors.whiteAlpha70} shadow>SCORE</Textc>
          <Textc size={38} lineHeight={42} color={Colors.aqua + 'aa'} bold shadow>{score}</Textc>
        </View>

        <View style={[styles.scoreView, { alignItems: 'flex-end' }]}>
          <Text style={styles.livesText}>
            {Array.from({ length: 3 }, (_, i) => {
              const livesMissed = missedWords;
              const livesRemaining = 3 - livesMissed;
              return i < livesRemaining ? '❤️' : '🖤';
            }).join('')}
          </Text>
          <Textc semiBold size={12} lineHeight={14} color={Colors.whiteAlpha70} shadow>{wordsMatchedCount} WORDS</Textc>
        </View>
      </View>
      <View style={styles.container}>


        {/* Game Area with Skia Canvas */}
        <View
          style={styles.gameArea}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setGameAreaHeight(height);
          }}
        >
          <Canvas style={{ flex: 1 }}>
            <RoundedRect
              x={0}
              y={0}
              width={SCREEN_WIDTH}
              height={gameAreaHeight}
              r={0}
            >
              <SkiaLinearGradient
                start={vec(0, 0)}
                end={vec(0, gameAreaHeight)}
                colors={[Colors.deepPurple, Colors.mediumPurple, Colors.darkBlue, Colors.tealBlue]}
              />
            </RoundedRect>

            {/* Render particles */}
            {particles.map(particle => (
              <Circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r={3 * particle.life}
                color={particle.color}
                opacity={particle.life}
              />
            ))}

            {/* Render falling words with effects */}
            {words.map(word => {
              // Calculate word position based on elapsed time (declarative animation)
              const now = timeRef.current;
              const elapsedTime = now - word.spawnTime;
              const progress = Math.min(elapsedTime / word.fallDuration, 1);
              const wordY = word.matched ? word.y : Math.max(-WORD_HEIGHT, progress * (gameAreaHeight - WORD_HEIGHT));

              // Calculate shimmer effect
              const shimmerPos = ((now / 2000) % 1 + (word.id * 0.2)) % 1;

              // Check for partial match with current input
              const upperInput = currentInput.trim().toUpperCase();
              const isPartialMatch = !word.matched && upperInput.length > 0 && word.text.startsWith(upperInput);
              const matchedLength = isPartialMatch ? upperInput.length : 0;

              return (
                <Group key={word.id}>
                  {/* Glow effect for matched words */}
                  {word.matched && (
                    <RoundedRect
                      x={word.x - 5}
                      y={wordY - 5}
                      width={word.text.length * 14 + 40}
                      height={50}
                      r={25}
                      color={Colors.aqua}
                      opacity={0.7}
                    >
                      <BlurMask blur={12} style="normal" />
                    </RoundedRect>
                  )}

                  {/* Highlight glow for partially matched words */}
                  {isPartialMatch && (
                    <RoundedRect
                      x={word.x - 3}
                      y={wordY - 3}
                      width={word.text.length * 14 + 38}
                      height={46}
                      r={23}
                      color={Colors.gold}
                      opacity={0.5}
                    >
                      <BlurMask blur={10} style="normal" />
                    </RoundedRect>
                  )}

                  {/* Word shadow */}
                  <RoundedRect
                    x={word.x + 2}
                    y={wordY + 2}
                    width={word.text.length * 14 + 32}
                    height={40}
                    r={20}
                    color={Colors.blackAlpha80}
                  />

                  {/* Word background with gradient */}
                  <RoundedRect
                    x={word.x}
                    y={wordY}
                    width={word.text.length * 14 + 32}
                    height={40}
                    r={20}
                  >
                    <SkiaLinearGradient
                      start={vec(0, wordY)}
                      end={vec(0, wordY + 40)}
                      colors={word.matched ? [Colors.cyan, Colors.darkCyan] : isPartialMatch ? [Colors.gold, Colors.darkOrange] : [Colors.white, Colors.lightGray]}
                    />
                  </RoundedRect>

                  {/* Shimmer overlay for falling words */}
                  {!word.matched && (
                    <RoundedRect
                      x={word.x}
                      y={wordY}
                      width={word.text.length * 14 + 32}
                      height={40}
                      r={20}
                    >
                      <SkiaLinearGradient
                        start={vec(word.x - 20 + shimmerPos * (word.text.length * 14 + 52), wordY)}
                        end={vec(word.x + 20 + shimmerPos * (word.text.length * 14 + 52), wordY)}
                        colors={[Colors.transparent, Colors.cyanAlpha50, Colors.transparent]}
                      />
                    </RoundedRect>
                  )}

                  {/* Word border */}
                  <RoundedRect
                    x={word.x + 1}
                    y={wordY + 1}
                    width={word.text.length * 14 + 30}
                    height={38}
                    r={19}
                    color="transparent"
                    style="stroke"
                    strokeWidth={2}
                  >
                    <SkiaLinearGradient
                      start={vec(0, wordY)}
                      end={vec(0, wordY + 40)}
                      colors={isPartialMatch ? [Colors.gold, Colors.deepOrange] : word.matched ? [Colors.cyan, Colors.darkCyan] : [Colors.cyan, Colors.purple]}
                    />
                  </RoundedRect>

                  {/* Word text - render full text first, then highlighted portion on top */}
                  <SkiaText
                    x={word.x + 16}
                    y={wordY + 28}
                    text={word.text}
                    color={word.matched ? Colors.white : Colors.deepPurple}
                    font={font}
                  />

                  {/* Render matched portion on top with highlight color */}
                  {!word.matched && isPartialMatch && (
                    <SkiaText
                      x={word.x + 16}
                      y={wordY + 28}
                      text={word.text.substring(0, matchedLength)}
                      color={Colors.orange}
                      font={font}
                    />
                  )}

                  {/* Trail effect for falling words */}
                  {!word.matched && wordY > 20 && (
                    <>
                      <Circle
                        cx={word.x + (word.text.length * 7)}
                        cy={wordY - 10}
                        r={2}
                        color={Colors.cyan}
                        opacity={0.4}
                      />
                      <Circle
                        cx={word.x + (word.text.length * 7)}
                        cy={wordY - 20}
                        r={1.5}
                        color={Colors.purple}
                        opacity={0.3}
                      />
                    </>
                  )}
                </Group>
              );
            })}
          </Canvas>
        </View>

        {/* Input Area */}
        {gameStarted && !gameOver && (
          <LinearGradient
            colors={[Colors.inputPurple1, Colors.inputPurple2, Colors.inputPurple3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inputContainer}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: Colors.white, borderColor: Colors.white, backgroundColor: Colors.whiteAlpha20, paddingRight: currentInput ? 50 : 20 }]}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Type the word..."
              placeholderTextColor={Colors.whiteAlpha70}
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              keyboardType="visible-password"
              autoFocus
            />
            {currentInput.length > 0 && (
              <Pressable
                style={[styles.clearButton, { backgroundColor: Colors.whiteAlpha30 }]}
                onPress={() => {
                  setCurrentInput('');
                  inputRef.current?.focus();
                }}
              >
                <Textc color={Colors.white} size={24} bold>×</Textc>
              </Pressable>
            )}
          </LinearGradient>
        )}

        {/* Countdown or Game Over Screen */}
        {/* {(showCountdown && !gameOver) && (
          <ThemedView style={styles.overlay}>
            <ThemedView style={[styles.countdownContainer, { backgroundColor: 'transparent' }]}>
              <Text style={styles.countdownText}>
                {countdown}
              </Text>
              <Text style={styles.countdownLabel}>
                GET READY!
              </Text>
            </ThemedView>
          </ThemedView>
        )} */}

        {/* Game Over Screen */}
        {gameOver && (
          <View style={styles.overlay}>
            <View style={styles.menuContainer}>
              <Textc bold size={32} style={styles.gameOverText}>
                Game Over!
              </Textc>
              {isNewHighScore && (
                <Textc bold size={18} style={styles.newHighScoreText}>
                  🎉 NEW HIGH SCORE! 🎉
                </Textc>
              )}
              <Textc bold size={24} style={styles.finalScore}>
                Score: {score}
              </Textc>
              <Textc size={16} style={styles.statsText}>
                Words Matched: {wordsMatchedCount}
              </Textc>

              <Pressable
                style={styles.playAgainButton}
                onPress={startGame}
              >
                <LinearGradient
                  colors={[Colors.neonGreen, Colors.cyan]}
                  style={styles.playAgainGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Textc size={20} bold style={{ letterSpacing: 2 }}>
                    ▶ PLAY AGAIN
                  </Textc>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={[styles.button, styles.backButton]}
                onPress={() => router.back()}
              >
                <Textc size={16} color={Colors.cyan}>Back to Home</Textc>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

export default WordRainGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  floatingContainer: {
    position: 'absolute',
    zIndex: 10,
    left: 20,
    right: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  scoreView: {
  },
  livesText: {
    color: Colors.neonGreen,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: Colors.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: Colors.transparent,
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
    color: Colors.white,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.cyan,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.blackAlpha70,
  },
  menuContainer: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
    backgroundColor: Colors.white,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    overflow: 'visible',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '900',
    color: Colors.neonGreen,
    textShadowColor: 'rgba(0, 255, 135, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    lineHeight: 140,
    textAlign: 'center',
    includeFontPadding: false,
  },
  countdownLabel: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 20,
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 40,
    textAlign: 'center',
    includeFontPadding: false,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: Colors.cyan,
  },
  newHighScoreText: {
    color: Colors.neonGreen,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 135, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  finalScore: {
    marginBottom: 8,
    textAlign: 'center',
  },
  statsText: {
    marginBottom: 2,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  playAgainButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  playAgainGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
  },
});
