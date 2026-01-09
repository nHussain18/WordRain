import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Word Rain</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Play the Game!</ThemedText>
        <ThemedText>
          Test your typing speed with Word Rain! Type the falling words before they reach the bottom.
        </ThemedText>
        <Pressable
          style={[styles.playButton, { backgroundColor: tintColor }]}
          onPress={() => router.push('/game')}
        >
          <ThemedText type="defaultSemiBold" style={styles.playButtonText}>
            🎮 Start Playing
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">How to Play</ThemedText>
        <ThemedText>
          • Words will fall from the top of the screen{'\n'}
          • Type each word exactly and press enter{'\n'}
          • Don't let 3 words reach the bottom{'\n'}
          • Score points for each word you type correctly
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">About</ThemedText>
        <ThemedText>
          Built with React Native and Expo. Features smooth animations using Reanimated.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  playButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  playButtonText: {
    color: '#222',
    fontSize: 18,
  },
});
