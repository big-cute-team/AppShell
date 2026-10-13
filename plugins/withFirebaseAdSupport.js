/**
 * Firebase Analytics(iOS)가 광고 식별자(IDFA)를 읽을 수 있게 AdSupport 프레임워크를 링크합니다.
 *
 * react-native-firebase는 기본적으로 AdSupport를 링크하지 않아, ATT를 허용받아도 Google Ads 설치 귀속에
 * IDFA가 쓰이지 않습니다. 플러그인 옵션이 없고 Podfile 변수(`$RNFirebaseAnalyticsEnableAdSupport`)로만
 * 켤 수 있어서 Podfile을 수정하는 config plugin으로 넣습니다 (CLAUDE.md: ios/ 직접 수정 금지).
 * 참고: https://rnfirebase.io/analytics/usage#advertising-id-collection
 */
const { withPodfile } = require('expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const withFirebaseAdSupport = (config) =>
  withPodfile(config, (mod) => {
    mod.modResults.contents = mergeContents({
      src: mod.modResults.contents,
      newSrc: '$RNFirebaseAnalyticsEnableAdSupport = true',
      tag: 'plick-firebase-adsupport',
      anchor: /prepare_react_native_project!/,
      offset: 1,
      comment: '#',
    }).contents;
    return mod;
  });

module.exports = withFirebaseAdSupport;
