/**
 * 앱 셸이 감싸는 모바일 웹의 설정.
 *
 * URL은 `EXPO_PUBLIC_WEB_URL` 환경변수로 덮어쓸 수 있습니다(.env 참고).
 * `EXPO_PUBLIC_` 접두사가 붙은 값은 번들 시점에 JS로 인라인되므로,
 * 비밀값(토큰/키)은 절대 여기에 두지 마세요.
 */

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
  // 소셜 로그인 등 웹뷰 안에서 처리해야 하는 도메인을 추가하세요.
  // 'accounts.google.com',
  // 'appleid.apple.com',
  // 'nid.naver.com',
  // 'kauth.kakao.com',
];

/** 웹이 "앱에서 열렸는지"를 판별할 수 있도록 User-Agent 뒤에 붙이는 문자열. */
export const USER_AGENT_SUFFIX = 'PlickApp';

/** 앱 배경색 — 스플래시/세이프에어리어/웹뷰 로딩 배경과 맞춰 둡니다. */
export const BACKGROUND_COLOR = '#FFFFFF';

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

  return INTERNAL_HOSTS.some((entry) => {
    const pattern = entry.toLowerCase();
    if (!pattern) return false;
    if (pattern.startsWith('.')) {
      return host === pattern.slice(1) || host.endsWith(pattern);
    }
    return host === pattern;
  });
}
