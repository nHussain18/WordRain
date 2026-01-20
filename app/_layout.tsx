import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSansRegular: require("../assets/fonts/Nunito-Regular.ttf"),
    NotoSansSemiBold: require("../assets/fonts/Nunito-SemiBold.ttf"),
    NotoSansMedium: require("../assets/fonts/Nunito-Medium.ttf"),
    NotoSansBold: require("../assets/fonts/Nunito-Bold.ttf"),
  });

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="game" options={{ headerShown: false }} />
    </Stack>
  );
}
