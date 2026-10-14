# 012. 앱 안 확대 차단을 웹 meta에서 셸로 이전

**상태: 🟡 진행 중** — 셸 코드 2026-10-14 반영. 웹 쪽 KAN-626 머지 뒤 실기기 확인 남음.
Jira [KAN-626](https://whoru3918.atlassian.net/browse/KAN-626) (프론트 접근성 작업).

## 왜 필요한가

웹은 Lighthouse 접근성 감점(WCAG 1.4.4) 때문에 meta viewport의 `maximumScale: 1, userScalable: false`를 걷어낸다.
지금 앱 셸의 확대 차단은 전부 그 meta에 기대고 있어서(react-native-webview는 Android 핀치 줌 기본 켜짐,
WKWebView는 meta를 그대로 따름) 웹이 바꾸는 순간 앱에서 핀치·더블탭 확대가 열린다.
앱에서는 릴스 스와이프·시트 드래그가 더블탭 확대에 깨지지 않게 계속 막기로 했다(2026-10-14).

## 1. 셸 코드 (이 저장소)

- [x] `src/config.ts` `BLOCK_PAGE_ZOOM` 스위치
- [x] Android: `setBuiltInZoomControls={false}` (핀치·더블탭 모두 내장 줌 메커니즘)
- [x] iOS: 로드 후 viewport meta를 `maximum-scale=1, user-scalable=no`로 고정하는 주입 스크립트 + MutationObserver
- [x] 1.2.0 빌드에 포함 (011과 같은 빌드)

## 2. 확인

- [x] iOS 시뮬레이터: 확대 제한이 없는 페이지(example.com)에서 핀치해도 확대 안 됨 (2026-10-14, 스위치 off 대조군은 확대됨)
- [ ] Android: 에뮬레이터는 핀치 입력이 어려워 실기기에서 확인
- [ ] 웹 KAN-626 머지 뒤 실기기에서 릴스 스와이프·시트 드래그·댓글 입력 회귀 확인
- [ ] Next.js 라우트 이동 뒤에도 iOS 확대가 막혀 있는지 (MutationObserver가 meta 갱신을 따라가는지)

## 3. 나중에

- [ ] 앱 안 확대를 허용하기로 바뀌면 `BLOCK_PAGE_ZOOM = false` 한 줄
