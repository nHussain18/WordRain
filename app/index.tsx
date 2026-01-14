import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark 
          ? ['#1a0033', '#0f002e', '#1a0066', '#2d0099'] 
          : ['#4a00e0', '#6a00f4', '#8e2de2', '#4a00e0']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles effect */}
        <View style={styles.particlesContainer}>
          <View style={[styles.particle, styles.particle1]} />
          <View style={[styles.particle, styles.particle2]} />
          <View style={[styles.particle, styles.particle3]} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.gameTitle}>WORD</Text>
            <Text style={[styles.gameTitle, styles.rainTitle]}>RAIN</Text>
            <Text style={styles.subtitle}>⚡ TYPE FAST OR LOSE ⚡</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <BlurView intensity={30} style={styles.statCard}>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>HIGH SCORE</ThemedText>
            </BlurView>
            <BlurView intensity={30} style={styles.statCard}>
              <ThemedText style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>GAMES PLAYED</ThemedText>
            </BlurView>
          </View>

          {/* Play Button */}
          <Pressable
            style={styles.playButton}
            onPress={() => router.push('/game')}
          >
            <LinearGradient
              colors={['#00ff87', '#00d4ff']}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ThemedText style={styles.playButtonText}>▶ PLAY NOW</ThemedText>
            </LinearGradient>
          </Pressable>

          {/* Quick Info */}
          <BlurView intensity={20} style={styles.infoBox}>
            <ThemedText style={styles.infoTitle}>HOW TO PLAY</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoText}>⌨️  Type falling words</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoText}>⚡  Press Enter to submit</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoText}>💀  Don't let 3 words drop</ThemedText>
            </View>
          </BlurView>
        </View>
      </LinearGradient>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  particle1: {
    top: '10%',
    left: '10%',
    width: 80,
    height: 80,
  },
  particle2: {
    top: '60%',
    right: '15%',
    width: 120,
    height: 120,
  },
  particle3: {
    bottom: '15%',
    left: '20%',
    width: 60,
    height: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    overflow: 'visible',
  },
  gameTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 255, 135, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
    lineHeight: 80,
    textAlign: 'center',
    includeFontPadding: false,
  },
  rainTitle: {
    marginTop: -15,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    letterSpacing: 3,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  statCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    minHeight: 100,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00ff87',
    lineHeight: 38,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginTop: 5,
    letterSpacing: 1,
  },
  playButton: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#00ff87',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  playButtonGradient: {
    paddingVertical: 22,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 3,
  },
  infoBox: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00ff87',
    marginBottom: 15,
    letterSpacing: 2,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
