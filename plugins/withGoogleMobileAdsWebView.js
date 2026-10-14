/**
 * Google Mobile Ads SDK(Android)를 "WebView API for Ads" 전용으로 넣습니다 (ADR-0006, docs/todo/011).
 *
 * 애드센스 정책은 앱 안 광고를 Google Mobile Ads SDK를 쓸 때만 허용합니다. 앱이 자기 WebView를
 * SDK에 등록하면(`MobileAds.registerWebView`) 그 안의 애드센스 광고가 허용되는 광고가 됩니다.
 * 등록 호출 자체는 react-native-webview 패치(patches/react-native-webview+13.16.1.patch)가
 * 리플렉션으로 수행하므로, 앱은 SDK 의존성과 매니페스트 선언만 제공하면 됩니다.
 *
 * - `play-services-ads` 의존성: app/build.gradle. 셸은 광고 유닛을 직접 띄우지 않으므로
 *   react-native-google-mobile-ads 같은 JS 라이브러리는 넣지 않습니다.
 * - `INTEGRATION_MANAGER=webview` 메타데이터: AdMob 앱 ID 검사를 건너뛰는 선언. 없으면
 *   SDK 초기화 ContentProvider가 앱 기동 시 IllegalStateException을 던집니다.
 *
 * iOS 쪽(pod, Info.plist)은 app.config.ts에서 expo-build-properties `extraPods`와 `infoPlist`로 표현됩니다.
 * 참고: https://developers.google.com/admob/android/webview/api-for-ads
 */
const { withAndroidManifest, withAppBuildGradle, AndroidConfig } = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

/**
 * https://developers.google.com/admob/android/rel-notes
 *
 * 25.3.0 이상은 Kotlin 2.3 메타데이터로 컴파일돼 있어 RN 0.86(Kotlin 2.1.20)에서
 * `Module was compiled with an incompatible version of Kotlin`으로 앱 컴파일이 깨집니다(2026-10-14 확인).
 * 25.2.0이 Kotlin 2.2 메타데이터인 마지막 버전입니다. RN의 Kotlin이 2.2+로 올라가면 올리세요.
 */
const PLAY_SERVICES_ADS_VERSION = '25.2.0';

const withGoogleMobileAdsWebView = (config) => {
  config = withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      app,
      'com.google.android.gms.ads.INTEGRATION_MANAGER',
      'webview',
    );
    return mod;
  });

  config = withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = mergeContents({
      src: mod.modResults.contents,
      newSrc: `    implementation("com.google.android.gms:play-services-ads:${PLAY_SERVICES_ADS_VERSION}")`,
      tag: 'plick-google-mobile-ads',
      anchor: /^dependencies\s*\{/,
      offset: 1,
      comment: '//',
    }).contents;
    return mod;
  });

  return config;
};

module.exports = withGoogleMobileAdsWebView;
