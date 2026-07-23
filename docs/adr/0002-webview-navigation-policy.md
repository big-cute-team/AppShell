# ADR-0002: 웹뷰 네비게이션 정책 (내부/외부/커스텀 스킴 분리)

- **상태**: Accepted
- **날짜**: 2026-07-23
- **관련**: [ADR-0001](./0001-expo-managed-workflow-for-webview-shell.md), `src/config.ts`, `src/WebShell.tsx`

## 배경

웹뷰 셸에서 가장 자주 터지는 문제는 링크 처리입니다. 아무 정책 없이 웹뷰에 URL을 던지면:

- 외부 사이트(약관 페이지, 광고, 블로그 링크)가 **주소창도 뒤로가기도 없는 앱 안에 갇힙니다.**
  사용자는 앱을 강제 종료하는 것 외에 탈출 방법이 없습니다.
- `tel:`, `mailto:`, `intent:`, `kakaotalk:` 같은 스킴은 웹뷰가 처리하지 못해
  `ERR_UNKNOWN_URL_SCHEME`으로 실패합니다.
- 소셜 로그인은 반대로 **웹뷰 안에서** 처리돼야 세션 쿠키가 원래 사이트로 돌아옵니다.
  외부 브라우저로 던지면 로그인이 앱으로 이어지지 않습니다.

또한 App Store 심사는 앱 안에 갇히는 외부 웹 콘텐츠에 민감합니다.

## 결정

**모든 네비게이션 요청을 `WebShell.tsx`의 `handleShouldStartLoad` 한 함수로 통과시키고,
세 갈래로 분기합니다.**

```
1. http(s)가 아닌 스킴        → Linking.openURL (OS에 위임)
2. INTERNAL_HOSTS에 매칭      → 웹뷰에서 그대로 로드
3. 그 외 http(s)             → WebBrowser.openBrowserAsync (인앱 브라우저)
```

허용 호스트 목록(`INTERNAL_HOSTS`)은 `src/config.ts`에 **데이터로** 둡니다.
`.` 로 시작하면 서브도메인까지 포함합니다 (`.plick.app` → `www.plick.app` 허용).

Android에서 `target="_blank"` 링크가 이 함수를 우회하지 않도록
`setSupportMultipleWindows={false}`를 함께 걸었습니다.

## 대안과 트레이드오프

| 대안 | 장점 | 단점 | 채택 |
| --- | --- | --- | --- |
| **허용 목록(allowlist) + 3분기** | 외부 콘텐츠가 앱에 갇히지 않음. 심사 안전. 로그인 도메인만 명시적으로 열어주면 됨 | 새 도메인이 생길 때마다 목록 갱신 필요 | ✅ |
| 전부 웹뷰에서 처리 | 설정 0 | 외부 사이트 탈출 불가, 커스텀 스킴 전멸, 심사 위험 | ❌ |
| 차단 목록(blocklist) | 초기 설정 부담 적음 | 모르는 도메인이 기본 허용 — 실패 시 조용히 위험한 쪽으로 기울어짐 | ❌ |
| 외부 브라우저(`Linking`)로 열기 | 구현 간단 | 앱을 벗어나 사용자 이탈. 인앱 브라우저가 사용자 경험상 우위 | ❌ |

허용 목록을 **코드가 아니라 설정 파일의 배열**로 둔 것이 핵심입니다.
"이 링크가 앱에서 안 열려요" 류의 요청은 대부분 `WebShell.tsx`를 건드릴 필요 없이
`INTERNAL_HOSTS`에 한 줄 추가로 끝나야 합니다.

## 결과

### 함께 정한 웹뷰 동작

| 설정 | 이유 |
| --- | --- |
| `sharedCookiesEnabled` + `thirdPartyCookiesEnabled` | 앱 재실행 후에도 로그인 세션 유지 |
| `applicationNameForUserAgent="PlickApp"` | 웹에서 `navigator.userAgent.includes('PlickApp')`로 앱 여부 판별 |
| `onRenderProcessGone` / `onContentProcessDidTerminate` → 재마운트 | 웹뷰 렌더러가 죽었을 때 흰 화면 대신 자동 복구 |
| `onHttpError`는 메인 프레임 + 5xx만 오류 처리 | 서브리소스 404나 4xx로 전체 화면을 날리지 않기 위해 |
| `textZoom={100}` | OS 글꼴 크기 설정으로 웹 레이아웃이 깨지는 것 방지 |
| 스플래시를 첫 로드 완료까지 유지 | 웹 로딩 중 흰 화면 깜빡임 제거 |
| `ErrorView`에서 `expo-network`로 오프라인 여부 구분 | "인터넷 없음"과 "서버 오류"의 안내 문구를 다르게 |

### 생긴 제약

- **소셜 로그인 도메인은 사전에 등록해야 합니다.** 네이버/카카오/구글/애플 로그인을 쓴다면
  각 인증 도메인을 `INTERNAL_HOSTS`에 넣기 전까지 로그인이 인앱 브라우저로 새어 나갑니다.
  → `docs/todo/001-web-url-and-domains.md`
- `textZoom={100}` 고정은 접근성 관점에서 논쟁 여지가 있습니다.
  웹이 반응형 타이포그래피를 갖추면 이 설정을 재검토해야 합니다.
- 당겨서 새로고침(`pullToRefreshEnabled`)은 **iOS에서만** 동작합니다.
  Android도 필요하면 별도 구현이 필요합니다.
