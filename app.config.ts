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
const VERSION = '1.1.1';

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

/**
 * Firebase(Google Analytics) — Google Ads iOS 앱 캠페인의 전환 추적용 (ADR-0005).
 * 설치·첫 실행(first_open)만 자동 수집하고, 추가 이벤트 코드는 두지 않습니다.
 * 두 파일은 Firebase 콘솔 → 프로젝트 설정에서 받은 공개 설정값(비밀값 아님)이라 커밋합니다.
 */
const FIREBASE_IOS_CONFIG = './GoogleService-Info.plist';
const FIREBASE_ANDROID_CONFIG = './google-services.json';

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
    googleServicesFile: FIREBASE_IOS_CONFIG,
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
      // 광고 네트워크별 iOS 설치 귀속(SKAdNetwork). 각 SDK 플러그인이 넣어 주지 않으므로 직접 등록합니다.
      // - Meta: https://developers.facebook.com/docs/SKAdNetwork (Facebook / Instagram)
      // - Google Ads: https://support.google.com/google-ads/answer/10005960
      SKAdNetworkItems: [
        { SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork' },
        { SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork' },
        { SKAdNetworkIdentifier: 'cstr6suwn9.skadnetwork' },
      ],
    },
  },
  android: {
    package: BUNDLE_ID,
    googleServicesFile: FIREBASE_ANDROID_CONFIG,
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
    // Firebase는 SPM 대신 CocoaPods로 받습니다(disableSPM). react-native-firebase 26 기본값인 SPM 모드는
    // 정적 링크(Expo 기본)와 함께 쓰면 pod install이 "SPM + static linkage is not supported"로 실패하고,
    // 동적 프레임워크로 바꾸는 쪽이 RN 생태계에서 더 위험해서 CocoaPods + 정적 프레임워크 조합을 택했습니다 (2026-10-06).
    ['@react-native-firebase/app', { ios: { disableSPM: true } }],
    '@react-native-firebase/analytics',
    // IDFA 링크(AdSupport) — 없으면 ATT를 허용받아도 Google Ads 설치 귀속에 식별자가 안 쓰입니다.
    './plugins/withFirebaseAdSupport.js',
    [
      'expo-build-properties',
      {
        // iOS 최소 지원 버전은 Expo SDK 기본값(16.4)을 따릅니다.
        // 더 높여야 하면 여기에 `ios: { deploymentTarget: '17.0' }` 를 추가하세요.
        ios: {
          // Firebase iOS SDK(CocoaPods 경로)는 정적 프레임워크로 링크해야 합니다 — react-native-firebase 요구사항.
          // 위 '@react-native-firebase/app'의 disableSPM과 한 쌍입니다.
          useFrameworks: 'static',
          // Expo 57의 사전 컴파일 모듈 모드는 대부분의 pod에서 프레임워크 링크를 끄는데,
          // react-native-firebase pod은 정적 프레임워크로 남겨야 합니다 (rnfirebase.io Expo 안내).
          forceStaticLinking: ['RNFBApp', 'RNFBAnalytics'],
        },
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
