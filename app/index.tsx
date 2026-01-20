import Textc from '@/components/Textc';
import { Colors } from '@/constants/theme';
import { useGameStore } from '@/store/game-store';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();
  const { highScore, accuracy } = useGameStore();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkModePurple1, Colors.darkModePurple2, Colors.darkModePurple3, Colors.darkModePurple4]}
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
            <Textc size={72} bold style={styles.gameTitle}>WORD</Textc>
            <Textc size={72} bold style={{ ...styles.gameTitle, ...styles.rainTitle }}>RAIN</Textc>
            <Text style={styles.subtitle}>⚡ TYPE FAST OR LOSE ⚡</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <BlurView intensity={30} style={styles.statCard}>
              <Textc bold size={32} color={Colors.neonGreen}>{highScore}</Textc>
              <Textc bold size={12} color={Colors.white}>HIGH SCORE</Textc>
            </BlurView>
            <BlurView intensity={30} style={styles.statCard}>
              <Textc bold size={32} color={Colors.neonGreen}>{accuracy}%</Textc>
              <Textc bold size={12} color={Colors.white}>ACCURACY</Textc>
            </BlurView>
          </View>

          {/* Play Button */}
          <Pressable
            style={styles.playButton}
            onPress={() => router.push('/game')}
          >
            <LinearGradient
              colors={[Colors.neonGreen, Colors.cyan]}
              style={styles.playButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Textc bold size={24} color={Colors.black} style={styles.playButtonText}>▶ PLAY NOW</Textc>
            </LinearGradient>
          </Pressable>

          {/* Quick Info */}
          <BlurView intensity={20} style={styles.infoBox}>
            <Textc bold size={16} color={Colors.neonGreen} style={styles.infoTitle}>HOW TO PLAY</Textc>
            <View style={styles.infoRow}>
              <Textc semiBold size={14} color={Colors.white}>⌨️  Type falling words</Textc>
            </View>
            <View style={styles.infoRow}>
              <Textc semiBold size={14} color={Colors.white}>⚡  Match before they hit bottom</Textc>
            </View>
            <View style={styles.infoRow}>
              <Textc semiBold size={14} color={Colors.white}>💀  Don't let 3 words drop</Textc>
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
    backgroundColor: Colors.whiteAlpha10,
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
    fontWeight: '900',
    color: Colors.white,
    textShadowColor: Colors.neonGreenShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
    lineHeight: 80,
    includeFontPadding: false,
  },
  rainTitle: {
    marginTop: -15,
    textShadowColor: Colors.cyanShadow,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
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
    backgroundColor: Colors.whiteAlpha10,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
    overflow: 'hidden',
    minHeight: 100,
  },
  playButton: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.neonGreen,
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
    letterSpacing: 3,
  },
  infoBox: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 20,
    backgroundColor: Colors.blackAlpha30,
    borderWidth: 1,
    borderColor: Colors.whiteAlpha20,
    overflow: 'hidden',
  },
  infoTitle: {
    marginBottom: 15,
    letterSpacing: 2,
  },
  infoRow: {
    marginBottom: 8,
  },
});
