import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * 앱 셸 설정.
 *
 * 버전/식별자를 바꿀 때는 이 파일만 수정하면 iOS·Android 양쪽에 반영됩니다.
 * 네이티브 프로젝트(ios/, android/)는 `npx expo prebuild`로 생성되므로 직접 수정하지 마세요.
 */
const APP_NAME = 'plick';
const APP_SLUG = 'plick';
const APP_SCHEME = 'plick';
const BUNDLE_ID = 'com.plick.app';

/** 스토어에 노출되는 사용자용 버전. */
const VERSION = '1.0.0';

/** 브랜드 컬러 — 스플래시 배경, 상태바 뒤 영역, 웹뷰 로딩 배경에 함께 쓰입니다. */
const BACKGROUND_COLOR = '#FFFFFF';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  scheme: APP_SCHEME,
  version: VERSION,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: BACKGROUND_COLOR,
  // iOS/Android 빌드 번호는 EAS가 자동 증가시킵니다(eas.json의 autoIncrement).
  ios: {
    bundleIdentifier: BUNDLE_ID,
    supportsTablet: false,
    infoPlist: {
      // 웹뷰가 HTTPS만 로드하도록 강제합니다. HTTP 자원이 필요하면 여기서 예외를 여세요.
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
      },
      // 웹에서 카메라/마이크/사진 접근을 쓰지 않는다면 아래 3개는 지워도 됩니다.
      NSCameraUsageDescription:
        '사진 촬영 및 업로드를 위해 카메라 접근 권한이 필요합니다.',
      NSPhotoLibraryUsageDescription:
        '사진을 업로드하기 위해 사진 보관함 접근 권한이 필요합니다.',
      NSMicrophoneUsageDescription:
        '동영상 촬영 시 마이크 접근 권한이 필요합니다.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: BACKGROUND_COLOR,
      },
    ],
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        // iOS 최소 지원 버전은 Expo SDK 기본값(16.4)을 따릅니다.
        // 더 높여야 하면 여기에 `ios: { deploymentTarget: '17.0' }` 를 추가하세요.
        android: {
          // HTTPS만 허용. 사내 HTTP 스테이징이 필요하면 true로 바꾸세요.
          usesCleartextTraffic: false,
        },
      },
    ],
  ],
  extra: {
    eas: {
      // `eas init` 실행 시 자동으로 채워집니다.
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
