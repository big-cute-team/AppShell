import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * 앱 셸 설정.
 *
 * 버전/식별자를 바꿀 때는 이 파일만 수정하면 iOS·Android 양쪽에 반영됩니다.
 * 네이티브 프로젝트(ios/, android/)는 `npx expo prebuild`로 생성되므로 직접 수정하지 마세요.
 */
const APP_NAME = '해축이모';
const APP_SLUG = 'plick';
const APP_SCHEME = 'plick';
const BUNDLE_ID = 'kr.co.plick.app';

/** 스토어에 노출되는 사용자용 버전. */
const VERSION = '1.1.0';

/** 앱 배경색 — 스플래시 배경, 상태바 뒤 영역, 웹뷰 로딩 배경에 함께 쓰입니다.
 * 웹(해축이모, 라이트 전용)의 `--plk-bg`와 동일하게 유지하세요
 * (src/config.ts의 BACKGROUND_COLOR와 한 쌍). */
const BACKGROUND_COLOR = '#FFFFFF';

/** 앱 아이콘의 초록 바탕 — Android 적응형 아이콘 배경 레이어.
 * assets/android-icon-foreground.png 에 구워진 초록과 같은 값이어야 전경·배경 경계가 안 보입니다. */
const ICON_BACKGROUND_COLOR = '#0FB569';

/**
 * Meta(인스타그램) 앱 설치 광고 연동 — ADR-0004, docs/todo/009.
 *
 * 개발자 앱: https://developers.facebook.com/apps/1849042269863007
 * 클라이언트 토큰은 앱 바이너리에 들어가도 되는 값입니다(Meta 문서상 공개 식별자).
 * 반대로 **앱 시크릿은 절대 여기 두지 마세요.**
 * 토큰 위치: 개발자 앱 → 앱 설정 → 고급 설정 → 보안 → 클라이언트 토큰.
 */
const META_APP_ID = '1849042269863007';
const META_CLIENT_TOKEN = '7657fe35b18fb878040e0e24528fd304';

/** iOS ATT(앱 추적 투명성) 팝업 문구. 거부해도 앱은 정상 동작합니다. */
const TRACKING_PERMISSION_TEXT =
  '광고 성과 측정을 위해 사용됩니다. 허용하지 않아도 앱의 모든 기능을 쓸 수 있습니다.';

/**
 * 로컬 개발 웹(`http://localhost:3001` 등)을 웹뷰에서 열기 위한 스위치.
 *
 * `.env`에 `ALLOW_CLEARTEXT_TRAFFIC=1`이 있을 때만 켜집니다.
 * `.env`는 커밋되지 않고 EAS 클라우드 빌드에도 올라가지 않으므로,
 * 스토어에 나가는 빌드는 자동으로 꺼진 상태(HTTPS 전용)가 됩니다.
 *
 * `EXPO_PUBLIC_` 접두사를 붙이지 않은 것은 의도적입니다 — 이 값은 빌드 시점에만
 * 필요하고 JS 번들에 인라인될 이유가 없습니다.
 */
const ALLOW_CLEARTEXT = process.env.ALLOW_CLEARTEXT_TRAFFIC === '1';

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
      //
      // NSAllowsLocalNetworking은 localhost/사설망(10.x, 192.168.x)에 한해 HTTP를 허용합니다.
      // 공개 인터넷에는 여전히 HTTPS가 강제되므로 NSAllowsArbitraryLoads와 달리
      // 심사에서 별도 소명을 요구받지 않습니다. 로컬 개발 웹을 띄우기 위해 켜 둡니다.
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
        NSAllowsLocalNetworking: true,
      },
      // 웹에서 카메라/마이크/사진 접근을 쓰지 않는다면 아래 3개는 지워도 됩니다.
      NSCameraUsageDescription:
        '사진 촬영 및 업로드를 위해 카메라 접근 권한이 필요합니다.',
      NSPhotoLibraryUsageDescription:
        '사진을 업로드하기 위해 사진 보관함 접근 권한이 필요합니다.',
      NSMicrophoneUsageDescription:
        '동영상 촬영 시 마이크 접근 권한이 필요합니다.',
      ITSAppUsesNonExemptEncryption: false,
      // Meta 광고의 iOS 설치 귀속(SKAdNetwork). react-native-fbsdk-next 플러그인은
      // 이 항목을 넣어 주지 않으므로 직접 등록합니다.
      // 출처: https://developers.facebook.com/docs/SKAdNetwork (Facebook / Instagram)
      SKAdNetworkItems: [
        { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
        { SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
      ],
    },
  },
  android: {
    package: BUNDLE_ID,
    adaptiveIcon: {
      backgroundColor: ICON_BACKGROUND_COLOR,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      // Android 13+ 광고 ID 읽기. Facebook SDK가 자체 매니페스트로도 선언하지만,
      // Play Console "광고 ID 선언"을 '사용함'으로 바꿔야 하는 이유가 드러나도록 명시합니다.
      'com.google.android.gms.permission.AD_ID',
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
      'react-native-fbsdk-next',
      {
        appID: META_APP_ID,
        clientToken: META_CLIENT_TOKEN,
        displayName: APP_NAME,
        scheme: `fb${META_APP_ID}`,
        // 설치·앱 실행 이벤트 자동 로깅까지만 씁니다. 화면·로그인 기능은 쓰지 않습니다.
        isAutoInitEnabled: true,
        autoLogAppEventsEnabled: true,
        advertiserIDCollectionEnabled: true,
        iosUserTrackingPermission: TRACKING_PERMISSION_TEXT,
      },
    ],
    ['expo-tracking-transparency', { userTrackingPermission: TRACKING_PERMISSION_TEXT }],
    [
      'expo-build-properties',
      {
        // iOS 최소 지원 버전은 Expo SDK 기본값(16.4)을 따릅니다.
        // 더 높여야 하면 여기에 `ios: { deploymentTarget: '17.0' }` 를 추가하세요.
        android: {
          // 기본은 HTTPS 전용. 로컬 개발 웹을 붙일 때만 `.env`의
          // ALLOW_CLEARTEXT_TRAFFIC=1 로 켭니다(위 ALLOW_CLEARTEXT 주석 참고).
          //
          // 안드로이드는 iOS처럼 "로컬만 허용"을 표현할 수 없어 전역 스위치가 됩니다.
          // 사내 HTTP 스테이징을 상시로 써야 한다면 network security config를
          // 붙이는 config plugin이 필요합니다.
          usesCleartextTraffic: ALLOW_CLEARTEXT,
        },
      },
    ],
  ],
  extra: {
    eas: {
      // @kimdowan1004s-team/plick (eas init으로 생성)
      projectId: '06a29df6-638e-4045-8f1f-738bb65a6da0',
    },
  },
});
