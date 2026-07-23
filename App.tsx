import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WebShell } from './src/WebShell';

// 웹 첫 로드가 끝날 때까지 스플래시를 유지합니다 (WebShell에서 hideAsync 호출).
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <SafeAreaProvider>
      <WebShell />
    </SafeAreaProvider>
  );
}
