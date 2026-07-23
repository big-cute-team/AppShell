import * as Network from 'expo-network';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';

import { ErrorView } from './components/ErrorView';
import {
  BACKGROUND_COLOR,
  PULL_TO_REFRESH,
  USER_AGENT_SUFFIX,
  WEB_URL,
  isInternalUrl,
} from './config';

/** 웹뷰가 아니라 OS가 처리해야 하는 스킴들 (전화·메일·문자·스토어·카카오/토스 등 앱 링크). */
const EXTERNAL_SCHEME = /^(?!https?:)([a-z][a-z0-9+.-]*):/i;

export function WebShell() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  /** key를 바꾸면 웹뷰가 완전히 새로 마운트됩니다 — 실패 후 재시도에 사용. */
  const [reloadKey, setReloadKey] = useState(0);

  // 첫 로드가 끝나거나 실패하면 스플래시를 내립니다.
  useEffect(() => {
    if (ready || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, error]);

  // Android 하드웨어 뒤로가기: 웹 히스토리가 있으면 앱 종료 대신 뒤로 이동.
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBackRef.current) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, []);

  const handleNavigationStateChange = useCallback((nav: WebViewNavigation) => {
    canGoBackRef.current = nav.canGoBack;
  }, []);

  /**
   * 모든 네비게이션 요청의 관문.
   * - 앱 내부 호스트 → 웹뷰에서 그대로 로드
   * - 외부 http(s) → 인앱 브라우저(주소창 있는 SFSafariViewController/CustomTabs)
   * - 그 외 스킴 → OS에 위임 (tel:, mailto:, intent:, kakaotalk: …)
   */
  const handleShouldStartLoad = useCallback((request: ShouldStartLoadRequest) => {
    const { url } = request;

    if (EXTERNAL_SCHEME.test(url)) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    if (isInternalUrl(url)) {
      return true;
    }

    WebBrowser.openBrowserAsync(url).catch(() => {});
    return false;
  }, []);

  const showError = useCallback(async () => {
    // 서버 오류인지 네트워크 단절인지 구분해서 안내 문구를 고릅니다.
    try {
      const state = await Network.getNetworkStateAsync();
      setOffline(!state.isInternetReachable);
    } catch {
      setOffline(false);
    }
    setError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setError(false);
    setReady(false);
    setReloadKey((key) => key + 1);
    setRetrying(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {error ? (
        <ErrorView offline={offline} retrying={retrying} onRetry={handleRetry} />
      ) : (
        <WebView
          key={reloadKey}
          ref={webViewRef}
          source={{ uri: WEB_URL }}
          style={styles.webView}
          // 웹이 앱 안에서 열렸는지 감지할 수 있게 UA에 표식을 남깁니다.
          applicationNameForUserAgent={USER_AGENT_SUFFIX}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadEnd={() => setReady(true)}
          // HTTP 상태 오류(4xx/5xx)는 메인 프레임일 때만 오류 화면으로 넘깁니다.
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.url === WEB_URL && nativeEvent.statusCode >= 500) {
              showError();
            }
          }}
          onError={showError}
          // 웹뷰 렌더러가 죽었을 때(메모리 부족 등) 흰 화면 대신 자동 복구.
          onRenderProcessGone={() => setReloadKey((key) => key + 1)}
          onContentProcessDidTerminate={() => setReloadKey((key) => key + 1)}
          // target="_blank" 링크도 onShouldStartLoadWithRequest를 타도록 강제합니다.
          setSupportMultipleWindows={false}
          // 개발 빌드에서만 Safari 웹 인스펙터(Develop 메뉴)에 웹뷰를 노출합니다.
          // iOS 16.4+는 isInspectable=true 가 아니면 인스펙터에 뜨지 않습니다.
          webviewDebuggingEnabled={__DEV__}
          allowsBackForwardNavigationGestures
          pullToRefreshEnabled={PULL_TO_REFRESH}
          // 로그인 세션이 앱 재실행 후에도 유지되도록 쿠키를 공유합니다.
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          // 웹의 <video autoplay>가 사용자 탭 없이 재생되게 합니다.
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          // 파일 업로드(<input type="file">) 지원.
          allowFileAccess
          originWhitelist={['https://*', 'http://*']}
          // 웹 폰트 크기가 OS 설정에 휘둘리지 않도록 고정합니다.
          textZoom={100}
          overScrollMode="never"
          startInLoadingState={false}
        />
      )}

      {/* 첫 로드 중 스플래시가 이미 내려간 짧은 구간을 위한 폴백 인디케이터. */}
      {!ready && !error && (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator size="large" color="#111111" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  webView: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND_COLOR,
  },
});
