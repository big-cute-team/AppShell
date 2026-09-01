/**
 * 앱 셸이 감싸는 모바일 웹의 설정.
 *
 * URL은 `EXPO_PUBLIC_WEB_URL` 환경변수로 덮어쓸 수 있습니다(.env 참고).
 * `EXPO_PUBLIC_` 접두사가 붙은 값은 번들 시점에 JS로 인라인되므로,
 * 비밀값(토큰/키)은 절대 여기에 두지 마세요.
 */

import Constants from 'expo-constants';

/** 앱이 처음 띄우는 모바일 웹 주소. */
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://m.plick.co.kr';

/**
 * 앱 안(웹뷰)에서 그대로 열어줄 호스트 목록.
 * 여기에 없는 호스트로의 이동은 시스템 브라우저로 넘깁니다
 * — 외부 사이트가 앱 껍데기 안에 갇히는 것을 막고, 스토어 심사에서도 안전합니다.
 *
 * 앞에 `.`을 붙이면 서브도메인까지 포함합니다(`.plick.app` → `www.plick.app` 허용).
 */
export const INTERNAL_HOSTS: string[] = [
  hostOf(WEB_URL),
  // .env로 WEB_URL을 로컬 주소로 덮어써도 프로덕션 도메인은 항상 앱 안에서 열립니다.
  '.plick.co.kr',
  // 소셜 로그인 — 로그인 페이지가 웹뷰 밖으로 새면 세션이 앱으로 돌아오지 못합니다.
  'kauth.kakao.com',
  'accounts.kakao.com',
  'accounts.google.com',
  // 구글은 첫 로그인 성공 직후 세션 동기화(SetSID)를 위해 유튜브 계정 도메인을
  // 경유합니다. 지역 도메인(accounts.google.co.kr 등)은 아래 정규식이 커버합니다.
  'accounts.youtube.com',
  'appleid.apple.com',
];

/**
 * 구글 계정 지역 도메인 (accounts.google.co.kr, accounts.google.de …).
 * 첫 로그인의 SetSID 리다이렉트가 접속 지역의 도메인을 경유하는데, 이게 웹뷰 밖으로
 * 새면 "400 malformed" 단독 페이지가 떠 첫 구글 로그인이 실패합니다.
 */
const GOOGLE_REGIONAL_ACCOUNTS = /^accounts\.google\.[a-z]{2,3}(\.[a-z]{2})?$/;

/** app.config.ts의 VERSION — 빌드에 임베드된 expoConfig에서 읽습니다. */
const APP_VERSION = Constants.expoConfig?.version;

/**
 * 웹이 "앱에서 열렸는지"와 앱 버전을 판별할 수 있도록 User-Agent 뒤에 붙이는 문자열.
 * 예: `PlickApp/1.0.0` — 버전은 app.config.ts의 VERSION이 빌드 시점에 임베드된 값입니다.
 * 웹에서는 `/PlickApp\/(\S+)/` 패턴으로 버전을 읽으세요. 버전을 못 읽는 환경에서는
 * 이전과 동일한 `PlickApp`만 붙습니다(웹의 기존 "앱 여부" 판별은 그대로 동작).
 */
export const USER_AGENT_SUFFIX = APP_VERSION ? `PlickApp/${APP_VERSION}` : 'PlickApp';

/** 앱 배경색 — 웹의 다크 배경색과 동일 값. 스플래시/세이프에어리어/웹뷰 로딩 배경과
 * 맞춰 둡니다 (app.config.ts의 BACKGROUND_COLOR와 한 쌍으로 관리). */
export const BACKGROUND_COLOR = '#0B0D12';

/** 당겨서 새로고침 허용 여부. 웹이 자체 스크롤 제스처를 쓰면 false로 두세요. */
export const PULL_TO_REFRESH = true;

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

/** 주어진 URL이 앱 웹뷰 안에서 열려야 하는지 판단합니다. */
export function isInternalUrl(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).host.toLowerCase();
  } catch {
    // about:blank 같은 상대/특수 스킴은 웹뷰가 알아서 처리하도록 둡니다.
    return true;
  }

  if (GOOGLE_REGIONAL_ACCOUNTS.test(host)) {
    return true;
  }

  return INTERNAL_HOSTS.some((entry) => {
    const pattern = entry.toLowerCase();
    if (!pattern) return false;
    if (pattern.startsWith('.')) {
      return host === pattern.slice(1) || host.endsWith(pattern);
    }
    return host === pattern;
  });
}
